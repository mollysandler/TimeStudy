from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy. We'll pass the Flask app instance to it later.
db = SQLAlchemy()

# Define our Item model
class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)

    def to_dict(self):
        """Converts the Item object to a dictionary for JSON serialization."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }