import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db, User, TimeStudy, Step

# --- Configuration ---
app = Flask(__name__)

# bsolute path of the directory where app.py is located
basedir = os.path.abspath(os.path.dirname(__file__))

# Define the path to the instance folder, relative to the app.py file
# This ensures the instance folder is always looked for next to app.py
instance_path = os.path.join(basedir, 'instance')

# Create the instance folder if it doesn't exist
if not os.path.exists(instance_path):
    try:
        os.makedirs(instance_path)
        print(f"Created instance folder at: {instance_path}")
    except OSError as e:
        print(f"Error creating instance folder {instance_path}: {e}")
        # Optionally, raise an exception or exit if this is critical
        # raise

# Set the SQLAlchemy database URI using the absolute path
# The 'sqlite:///' prefix is for an absolute path on Unix-like systems
# or a relative path from the drive root on Windows.
# For SQLite, if the path doesn't start with a slash, it's relative to the CWD.
# To ensure it's always relative to our instance_path, we construct it carefully.
db_path = os.path.join(instance_path, 'items.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}' # Note the 3 slashes for an absolute path

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Initialize Extensions ---
CORS(app)
db.init_app(app)

# --- Database Creation (Run once) ---
# This context is needed for SQLAlchemy to know about your app
with app.app_context():
    try:
        db.create_all() # Creates the database tables based on your models if they don't exist
        print(f"Database tables created/verified. DB should be at: {db_path}")
    except Exception as e:
        print(f"Error during db.create_all(): {e}")
        # Log the full traceback for detailed debugging if needed
        import traceback
        traceback.print_exc()


# --- API Endpoints (Routes) ---
@app.route('/')
def home():
    return "Hello from Flask Backend!"

# --- USERS ---

# POST create new user
@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data or not data.get('username'):
        return jsonify({'error': 'Username is required'}), 400
    
    existing_user = User.query.filter_by(username=data['username']).first()
    if existing_user:
        return jsonify({'error': 'Username already exists'}), 400
        
    new_user = User(username=data['username'])
    new_user.role = data['role']
    db.session.add(new_user)
    db.session.commit()
    return jsonify(new_user.to_dict()), 201

# GET all users
@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

# --- TIME STUDIES ---
# POST create a new TimeStudy
@app.route('/api/time_studies', methods=['POST'])
def create_time_study():
    data = request.get_json()

    # Basic validation
    if not data or not data.get('name') or data.get('admin_id') is None:
        return jsonify({'error': 'Missing required fields: name, admin_id'}), 400

    admin = User.query.get(data['admin_id'])
    if not admin:
        return jsonify({'error': f"Admin with id {data['admin_id']} not found"}), 404

    new_study = TimeStudy(
        name=data['name'],
        estimated_total_time=data.get('estimated_total_time'),
        status=data.get('status', 'not started'), # Default to 'not started' if not provided
        admin_id=admin.id # Assign the admin
    )
    db.session.add(new_study)
    # Must commit here so new_study gets an ID before adding steps/machinists if they depend on it immediately
    # Or add them to the session and commit once at the end. Let's try committing once.

    # Handle Steps (list of step objects expected in data)
    if 'steps' in data and isinstance(data['steps'], list):
        for step_data in data['steps']:
            if not step_data.get('name') or step_data.get('order') is None:
                # Rollback if there's an issue, or decide to skip invalid steps
                db.session.rollback()
                return jsonify({'error': 'Each step must have a name and order'}), 400
            step = Step(
                name=step_data['name'],
                estimated_time=step_data.get('estimated_time'),
                order=step_data['order'],
                time_study=new_study # Associate with the new study
            )
            db.session.add(step)

    # Handle Machinists (list of machinist user IDs expected in data)
    if 'machinist_ids' in data and isinstance(data['machinist_ids'], list):
        for machinist_id in data['machinist_ids']:
            machinist = User.query.get(machinist_id)
            if machinist:
                new_study.machinists.append(machinist) # SQLAlchemy handles the association table
            else:
                # Decide how to handle: error out, or just log and skip?
                print(f"Warning: Machinist with id {machinist_id} not found. Skipping.")

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create time study', 'details': str(e)}), 500
        
    return jsonify(new_study.to_dict()), 201

# GET all TimeStudies
@app.route('/api/time_studies', methods=['GET'])
def get_time_studies():
    studies = TimeStudy.query.all()
    return jsonify([study.to_dict() for study in studies])

# GET a single TimeStudy by ID
@app.route('/api/time_studies/<int:study_id>', methods=['GET'])
def get_time_study(study_id):
    study = TimeStudy.query.get_or_404(study_id) # Returns 404 if not found
    return jsonify(study.to_dict())


# PUT - UPDATE a TimeStudy (This is what you're missing for saving timers)
@app.route('/api/time_studies/<int:study_id>', methods=['PUT']) # Add this route
def update_time_study(study_id):
    study = TimeStudy.query.get_or_404(study_id)
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body cannot be empty'}), 400

    if 'status' in data:
        study.status = data['status']
    if 'actual_total_time' in data: # Expecting seconds
        study.actual_total_time = data['actual_total_time']
    if 'notes' in data: # For overall study notes (e.g., scrap reason)
        study.notes = data['notes']
    # Add any other fields from TimeStudy model you want to be updatable
    # e.g., name, estimated_total_time (though less common to update estimates after starting)

    db.session.commit()
    return jsonify(study.to_dict())

# --- STEPS ---
# POST add a step to a time study
@app.route('/api/time_studies/<int:study_id>/steps', methods=['POST'])
def add_step_to_time_study(study_id):
    study = TimeStudy.query.get_or_404(study_id)
    data = request.get_json()

    if not data or not data.get('name') or data.get('order') is None:
        return jsonify({'error': 'Step name and order are required'}), 400

    new_step = Step(
        name=data['name'],
        estimated_time=data.get('estimated_time'),
        order=data['order'],
        time_study_id=study.id # or time_study = study
    )
    db.session.add(new_step)
    db.session.commit()

    return jsonify(new_step.to_dict()), 201

# PUT - UPDATE a Step (This is what you're missing for saving individual step timers)
@app.route('/api/steps/<int:step_id>', methods=['PUT']) # Add this route
def update_step(step_id):
    step = Step.query.get_or_404(step_id)
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body cannot be empty'}), 400

    if 'actual_time' in data: # Expecting seconds
        step.actual_time = data['actual_time']
    if 'notes' in data:
        step.notes = data['notes']
    # Add any other fields from Step model you want to be updatable
    # e.g., name, estimated_time, order

    db.session.commit()
    return jsonify(step.to_dict())


# --- Run the App ---
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)