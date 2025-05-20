import os # <--- Make sure this import is at the top
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db, Item

# --- Configuration ---
app = Flask(__name__)

# Get the absolute path of the directory where app.py is located
basedir = os.path.abspath(os.path.dirname(__file__))

# Define the path to the instance folder, relative to the app.py file
# This ensures the instance folder is always looked for next to app.py
instance_path = os.path.join(basedir, 'instance')

# Create the instance folder if it doesn't exist
# This is good practice, though you said it exists, it doesn't hurt.
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
# ... (rest of your routes, no changes needed here) ...
@app.route('/')
def home():
    return "Hello from Flask Backend!"

# GET all items
@app.route('/api/items', methods=['GET'])
def get_items():
    items = Item.query.all() # Get all Item objects from the database
    return jsonify([item.to_dict() for item in items]) # Convert each item to a dict and return as JSON

# GET a single item by ID
@app.route('/api/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = Item.query.get_or_404(item_id) # Get item by ID or return 404 if not found
    return jsonify(item.to_dict())

# CREATE a new item
@app.route('/api/items', methods=['POST'])
def create_item():
    data = request.get_json() # Get data from the request body (expected to be JSON)
    if not data or not 'name' in data:
        return jsonify({'error': 'Missing name in request body'}), 400

    new_item = Item(name=data['name'], description=data.get('description')) # Create new Item
    db.session.add(new_item) # Add it to the database session
    db.session.commit()      # Commit (save) the changes to the database
    return jsonify(new_item.to_dict()), 201 # Return the created item and 201 status

# UPDATE an existing item
@app.route('/api/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    item = Item.query.get_or_404(item_id)
    data = request.get_json()

    if 'name' in data:
        item.name = data['name']
    if 'description' in data:
        item.description = data['description']

    db.session.commit()
    return jsonify(item.to_dict())

# DELETE an item
@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    item = Item.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Item deleted successfully'}), 200 # Or use 204 No Content


# --- Run the App ---
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)