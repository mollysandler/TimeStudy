import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db, User, TimeStudy, Step

load_dotenv()

app = Flask(__name__)

# --- Configuration ---
DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    # Fallback for local development if DATABASE_URL is not in .env or environment
    basedir = os.path.abspath(os.path.dirname(__file__))
    instance_path = os.path.join(basedir, 'instance')
    if not os.path.exists(instance_path):
        os.makedirs(instance_path)
    db_path = os.path.join(instance_path, 'items.db')
    DATABASE_URL = f'sqlite:///{db_path}'
    print(f"WARNING: DATABASE_URL not found, using default SQLite: {DATABASE_URL}")

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Initialize Extensions ---
# For Render, set PROD_FRONTEND_URL in environment variables
# PROD_FRONTEND_URL = os.environ.get('PROD_FRONTEND_URL')
# origins = ["http://localhost:5173"] # Your local Vite dev server
# if PROD_FRONTEND_URL:
#     origins.append(PROD_FRONTEND_URL)
# CORS(app, resources={r"/api/*": {"origins": origins}})
CORS(app, resources={r"/api/*": {"origins": "*"}}) # Keep it open for now during debugging

db.init_app(app)

# --- Database Creation ---
with app.app_context():
    try:
        db.create_all()
        # The print statement about db_path is only relevant for SQLite
        # For PostgreSQL, tables are created in the remote DB.
        if 'sqlite' in DATABASE_URL:
             print(f"Database tables created/verified. DB should be at: {DATABASE_URL.replace('sqlite:///', '')}")
        else:
             print(f"Database tables created/verified for: {DATABASE_URL.split('@')[-1]}") # Prints DB host/name
    except Exception as e:
        print(f"Error during db.create_all(): {e}")
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
                # this is not real error handling 
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


# PUT - UPDATE a TimeStudy
@app.route('/api/time_studies/<int:study_id>', methods=['PUT'])
def update_time_study(study_id):
    study = TimeStudy.query.get_or_404(study_id)
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body cannot be empty'}), 400

    if 'status' in data:
        study.status = data['status']
    if 'actual_total_time' in data: 
        study.actual_total_time = data['actual_total_time']
    if 'notes' in data: 
        study.notes = data['notes']

    db.session.commit()
    return jsonify(study.to_dict())

# DELETE a TimeStudy
@app.route('/api/time_studies/<int:study_id>', methods=['DELETE'])
def delete_time_study(study_id):
    study = TimeStudy.query.get_or_404(study_id) # Find the study or return 404

    try:
        # Because of `cascade="all, delete-orphan"` on TimeStudy.steps,
        # deleting the TimeStudy will also delete its associated Step records.
        db.session.delete(study)
        db.session.commit()
        return jsonify({'message': f'Time Study "{study.name}" and its steps deleted successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error deleting time study {study_id}: {str(e)}")
        return jsonify({'error': 'Failed to delete time study', 'details': str(e)}), 500

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
        time_study_id=study.id
    )
    db.session.add(new_step)
    db.session.commit()

    return jsonify(new_step.to_dict()), 201

# PUT - UPDATE a Step 
@app.route('/api/steps/<int:step_id>', methods=['PUT']) 
def update_step(step_id):
    step = Step.query.get_or_404(step_id)
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body cannot be empty'}), 400

    if 'actual_time' in data: 
        step.actual_time = data['actual_time']
    if 'notes' in data:
        step.notes = data['notes']

    db.session.commit()
    return jsonify(step.to_dict())

# DELETE a Step
@app.route('/api/steps/<int:step_id>', methods=['DELETE'])
def delete_step(step_id):
    step = Step.query.get_or_404(step_id) # Find the step or return 404

    try:
        db.session.delete(step)
        db.session.commit()
        return jsonify({'message': f'Step "{step.name}" deleted successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error deleting step {step_id}: {str(e)}")
        return jsonify({'error': 'Failed to delete step', 'details': str(e)}), 500


# this is only for dev
# # --- Run the App ---
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)