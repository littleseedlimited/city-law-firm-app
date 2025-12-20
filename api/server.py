"""
Flask API Server for City Law Firm Mini-App
Serves real database data to the Telegram Mini-App
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import sys
import os

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.models import init_db, get_session, User, Case, CourtDate, ComplianceTask, TimeEntry, Notification
from datetime import datetime, timedelta
from sqlalchemy import func
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for Mini-App access

# Initialize database
engine = init_db()

@app.route('/api/user/<int:telegram_id>', methods=['GET'])
def get_user(telegram_id):
    """Get user profile data"""
    session = get_session(engine)
    try:
        user = session.query(User).filter_by(telegram_id=telegram_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'id': user.id,
            'telegram_id': user.telegram_id,
            'full_name': user.full_name,
            'email': user.email,
            'phone': user.phone,
            'departments': user.departments,
            'position': user.position,
            'role': user.role,
            'address': user.address,
            'photo_file_id': user.photo_file_id,
            'latitude': user.latitude,
            'longitude': user.longitude,
            'last_seen': user.last_seen.isoformat() if user.last_seen else None,
            'status': user.status
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/cases/<int:telegram_id>', methods=['GET'])
def get_cases(telegram_id):
    """Get user's cases"""
    session = get_session(engine)
    try:
        user = session.query(User).filter_by(telegram_id=telegram_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        cases = session.query(Case).filter_by(assigned_to=user.id).all()
        
        return jsonify({
            'cases': [{
                'id': c.id,
                'case_number': c.case_number,
                'title': c.title,
                'client_name': c.client_name,
                'case_type': c.case_type,
                'status': c.status,
                'priority': c.priority,
                'filing_date': c.filing_date.isoformat() if c.filing_date else None,
                'next_court_date': c.next_court_date.isoformat() if c.next_court_date else None,
                'deadline': c.deadline.isoformat() if c.deadline else None,
            } for c in cases]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/agenda/<int:telegram_id>', methods=['GET'])
def get_agenda(telegram_id):
    """Get user's agenda (court dates, tasks, time entries)"""
    session = get_session(engine)
    try:
        user = session.query(User).filter_by(telegram_id=telegram_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        today = datetime.now().date()
        week_from_now = today + timedelta(days=7)
        
        # Court Dates
        court_dates = session.query(CourtDate).join(Case).filter(
            Case.assigned_to == user.id,
            CourtDate.hearing_date >= datetime.now(),
            CourtDate.hearing_date <= datetime.combine(week_from_now, datetime.max.time())
        ).order_by(CourtDate.hearing_date).all()
        
        # Tasks
        tasks = session.query(ComplianceTask).filter(
            ComplianceTask.assigned_to == user.id,
            ComplianceTask.status == 'pending'
        ).all()
        
        # Time Entries (Today)
        time_entries = session.query(TimeEntry).filter(
            TimeEntry.user_id == user.id,
            func.date(TimeEntry.date) == today
        ).all()
        
        return jsonify({
            'court_dates': [{
                'id': cd.id,
                'case_number': cd.case.case_number,
                'court_name': cd.court_name,
                'hearing_date': cd.hearing_date.isoformat(),
                'purpose': cd.purpose
            } for cd in court_dates],
            'tasks': [{
                'id': t.id,
                'title': t.title,
                'due_date': t.due_date.isoformat() if t.due_date else None,
                'status': t.status
            } for t in tasks],
            'time_entries': [{
                'id': te.id,
                'duration': te.duration_minutes / 60,  # Convert to hours
                'description': te.description,
                'date': te.date.isoformat()
            } for te in time_entries],
            'total_hours': sum(te.duration_minutes for te in time_entries) / 60
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    """Get latest notifications"""
    session = get_session(engine)
    try:
        # Filter notifications from the last 48 hours
        forty_eight_hours_ago = datetime.utcnow() - timedelta(hours=48)
        
        notifications = session.query(Notification).filter(
            Notification.created_at >= forty_eight_hours_ago
        ).order_by(
            Notification.created_at.desc()
        ).limit(20).all()
        
        return jsonify({
            'notifications': [{
                'id': n.id,
                'title': n.title,
                'message': n.message,
                'notification_type': n.notification_type,
                'priority': n.priority,
                'created_at': n.created_at.isoformat()
            } for n in notifications]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/notifications/<int:notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    """Delete a notification"""
    session = get_session(engine)
    try:
        notification = session.query(Notification).get(notification_id)
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
            
        session.delete(notification)
        session.commit()
        return jsonify({'success': True})
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/staff', methods=['GET'])
def get_staff():
    """Get all staff members with status"""
    session = get_session(engine)
    try:
        # Get all active users
        users = session.query(User).filter_by(status='active').all()
        
        # Determine online status (last seen within 5 minutes)
        now = datetime.utcnow()
        
        return jsonify({
            'staff': [{
                'id': u.id,
                'full_name': u.full_name,
                'position': u.position,
                'departments': u.departments,
                'photo_file_id': u.photo_file_id,
                'latitude': u.latitude,
                'longitude': u.longitude,
                'last_seen': u.last_seen.isoformat() if u.last_seen else None,
                'is_online': (now - u.last_seen).total_seconds() < 300 if u.last_seen else False
            } for u in users]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

if __name__ == '__main__':
    port = int(os.getenv('API_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
