from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy
db = SQLAlchemy()

# Association table for the many-to-many relationship between TimeStudy and Machinists
# This table just holds foreign keys to link TimeStudies and Machinists.
time_study_machinists_association = db.Table('time_study_machinists',
    db.Column('time_study_id', db.Integer, db.ForeignKey('time_study.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True)
)

# user class
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True) # User's unique ID
    username = db.Column(db.String(80), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'admin', 'machinist'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role
        }


# step class for time study
class Step(db.Model):
    id = db.Column(db.Integer, primary_key=True) # Step's unique ID
    name = db.Column(db.String(200), nullable=False) # Name of the step
    estimated_time = db.Column(db.Integer, nullable=True) # Estimated time in minutes (or seconds, be consistent)
    order = db.Column(db.Integer, nullable=False) # To maintain the order of steps

    time_study_id = db.Column(db.Integer, db.ForeignKey('time_study.id'), nullable=False)
    # The 'time_study' backref will be created by the relationship in TimeStudy model

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'estimated_time': self.estimated_time,
            'order': self.order,
            'time_study_id': self.time_study_id
        }


# time study class
class TimeStudy(db.Model):
    id = db.Column(db.Integer, primary_key=True) # Time Study unique ID
    name = db.Column(db.String(150), nullable=False) # Name of the study
    estimated_total_time = db.Column(db.Integer, nullable=True) # Estimated time in minutes (or seconds)
    status = db.Column(db.String(50), default='not started', nullable=False) # 'not started', 'in progress', 'completed'

    # Foreign Key for the Admin in charge
    admin_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # Relationship to load the Admin User object
    # 'User' is the class name of the related model.
    # 'backref' creates a virtual 'administered_studies' attribute on the User model,
    # so you can do user.administered_studies to get all studies they admin.
    # 'foreign_keys' explicitly tells SQLAlchemy which column to use for this relationship.
    admin = db.relationship('User', backref=db.backref('administered_studies', lazy=True), foreign_keys=[admin_id])

    # One-to-Many relationship with Step
    # 'Step' is the class name.
    # 'backref' creates a virtual 'time_study' attribute on the Step model.
    # 'lazy=True' means steps are loaded when accessed (default behavior).
    # 'cascade="all, delete-orphan"' means if a TimeStudy is deleted, its associated Steps are also deleted.
    steps = db.relationship('Step', backref='time_study', lazy=True, cascade="all, delete-orphan")

    # Many-to-Many relationship with User (for Machinists)
    # 'secondary' points to our association table.
    # 'lazy='subquery'' is a loading strategy: loads machinists in a separate query but joins.
    # 'backref' creates a virtual 'assigned_time_studies' attribute on the User model
    # so you can do user.assigned_time_studies to get studies a machinist is on.
    machinists = db.relationship('User', secondary=time_study_machinists_association, lazy='subquery',
                                 backref=db.backref('assigned_time_studies', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'estimated_total_time': self.estimated_total_time,
            'number_of_steps': len(self.steps), # Calculated dynamically
            'status': self.status,
            'admin': self.admin.to_dict() if self.admin else None, # Include admin details
            'admin_id': self.admin_id,
            'steps': sorted([step.to_dict() for step in self.steps], key=lambda s: s['order']), # Include step details, sorted
            'machinists': [machinist.to_dict() for machinist in self.machinists] # Include machinist details
        }