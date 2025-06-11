import os
import json
from flask import Flask, render_template, request, redirect, url_for, send_from_directory, session, flash, jsonify
from werkzeug.utils import secure_filename
from functools import wraps

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Change this!

DATA_FILE = 'data/movies.json'
MOVIES_ROOT = 'static/movies'

ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'admin'

ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mkv', 'webm', 'avi', 'mov', 'flv'}  # extend as needed

def allowed_video_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_VIDEO_EXTENSIONS

os.makedirs(MOVIES_ROOT, exist_ok=True)
os.makedirs('data', exist_ok=True)

def load_movies():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'w') as f:
            f.write('[]')
    try:
        with open(DATA_FILE, 'r') as f:
            content = f.read().strip()
            if not content:
                return []
            return json.loads(content)
    except json.JSONDecodeError:
        with open(DATA_FILE, 'w') as f:
            f.write('[]')
        return []

def save_movies(movies):
    with open(DATA_FILE, 'w') as f:
        json.dump(movies, f, indent=4)

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated

@app.route('/')
def index():
    movies = load_movies()
    return render_template('index.html', movies=movies)

@app.route('/download/<movie_id>')
def download_movie(movie_id):
    movies = load_movies()
    movie = next((m for m in movies if m['id'] == movie_id), None)
    if not movie:
        return "Movie not found", 404
    movie_folder = os.path.join(MOVIES_ROOT, movie_id)
    # Use the correct video file and extension
    video_file = movie.get('video_file')
    if not video_file:
        return "Movie file missing", 404
    video_path = os.path.join('static', video_file)
    if not os.path.exists(video_path):
        return "Movie file missing", 404
    filename = os.path.basename(video_path)
    return send_from_directory(movie_folder, filename, as_attachment=True,
                               download_name=f"{movie['title']}{os.path.splitext(filename)[1]}")

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        if (request.form.get('username') == ADMIN_USERNAME and
            request.form.get('password') == ADMIN_PASSWORD):
            session['logged_in'] = True
            return redirect(url_for('admin_panel'))
        else:
            flash('Invalid credentials', 'danger')
    return render_template('admin_login.html')

@app.route('/admin/logout')
@login_required
def admin_logout():
    session.clear()
    return redirect(url_for('admin_login'))

@app.route('/admin', methods=['GET'])
@login_required
def admin_panel():
    q = request.args.get('q', '').strip().lower()
    movies = load_movies()
    if q:
        movies = [
            m for m in movies
            if q in m['title'].lower() or any(q in g.lower() for g in m.get('genres', []))
        ]
    return render_template('admin_panel.html', movies=movies)

@app.route('/admin/upload', methods=['POST'])
@login_required
def upload_movie():
    title = request.form.get('title', '').strip()
    rating = request.form.get('rating', '').strip()
    language = request.form.get('language', '').strip()
    duration = request.form.get('duration', '').strip()
    genres = request.form.get('genres', '').strip()
    top_rated = request.form.get('top_rated') == 'on'

    movie_file = request.files.get('movie_file')
    poster_file = request.files.get('poster_file')

    # Check required fields and files
    if not (title and rating and language and duration and movie_file and poster_file):
        error_msg = 'All fields and files are required.'
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'error': error_msg}), 400
        flash(error_msg, 'danger')
        return redirect(url_for('admin_panel'))

    # Validate video file extension
    if not allowed_video_file(movie_file.filename):
        error_msg = 'Unsupported video format. Allowed formats: ' + ', '.join(ALLOWED_VIDEO_EXTENSIONS)
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'error': error_msg}), 400
        flash(error_msg, 'danger')
        return redirect(url_for('admin_panel'))

    # Secure and normalize movie ID
    movie_id = secure_filename(title.lower().replace(' ', '_'))

    movie_folder = os.path.join(MOVIES_ROOT, movie_id)
    if os.path.exists(movie_folder):
        error_msg = 'Movie with this title already exists.'
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'error': error_msg}), 400
        flash(error_msg, 'danger')
        return redirect(url_for('admin_panel'))

    os.makedirs(movie_folder)

    # Save video file with original extension
    video_ext = os.path.splitext(movie_file.filename)[1].lower()  # e.g., '.mkv', '.webm'
    movie_path = os.path.join(movie_folder, f'movie{video_ext}')
    poster_path = os.path.join(movie_folder, 'poster.jpg')
    title_path = os.path.join(movie_folder, 'title.txt')

    try:
        movie_file.save(movie_path)
        poster_file.save(poster_path)
        with open(title_path, 'w', encoding='utf-8') as f:
            f.write(title)
    except Exception as e:
        error_msg = f"Failed to save files: {e}"
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'error': error_msg}), 500
        flash(error_msg, 'danger')
        return redirect(url_for('admin_panel'))

    movies = load_movies()
    new_movie = {
        'id': movie_id,
        'title': title,
        'rating': rating,
        'language': language,
        'duration': duration,
        'genres': [g.strip() for g in genres.split(',') if g.strip()],
        'top_rated': top_rated,
        'poster': f'movies/{movie_id}/poster.jpg',
        'video_file': f'movies/{movie_id}/movie{video_ext}'  # Store the actual video filename with extension
    }
    movies.append(new_movie)
    save_movies(movies)

    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'success': True}), 200

    flash(f'Movie \"{title}\" uploaded successfully!', 'success')
    return redirect(url_for('admin_panel'))
@app.route('/admin/delete_movie/<movie_id>', methods=['POST', 'GET'])
@login_required
def delete_movie(movie_id):
    movies = load_movies()
    movie = next((m for m in movies if m['id'] == movie_id), None)
    if not movie:
        flash("Movie not found.", "danger")
        return redirect(url_for('admin_panel'))

    # Remove movie folder and files
    movie_folder = os.path.join(MOVIES_ROOT, movie_id)
    if os.path.exists(movie_folder):
        import shutil
        shutil.rmtree(movie_folder)

    # Remove movie from JSON
    movies = [m for m in movies if m['id'] != movie_id]
    save_movies(movies)

    flash(f'Movie "{movie["title"]}" deleted successfully.', "success")
    return redirect(url_for('admin_panel'))

@app.route('/admin/edit_movie', methods=['POST'])
@login_required
def edit_movie():
    movie_id = request.form.get('movie_id')
    if not movie_id:
        flash("Invalid movie ID.", "danger")
        return redirect(url_for('admin_panel'))

    movies = load_movies()
    movie = next((m for m in movies if m['id'] == movie_id), None)
    if not movie:
        flash("Movie not found.", "danger")
        return redirect(url_for('admin_panel'))

    # Update fields
    title = request.form.get('title', '').strip()
    rating = request.form.get('rating', '').strip()
    language = request.form.get('language', '').strip()
    duration = request.form.get('duration', '').strip()
    genres = request.form.get('genres', '').strip()
    top_rated = request.form.get('top_rated') == 'on'

    if not (title and rating and language and duration):
        flash("Please fill in all required fields.", "danger")
        return redirect(url_for('admin_panel'))

    # Update movie data
    movie['title'] = title
    movie['rating'] = rating
    movie['language'] = language
    movie['duration'] = duration
    movie['genres'] = [g.strip() for g in genres.split(',') if g.strip()]
    movie['top_rated'] = top_rated

    # Handle poster update if provided
    poster_file = request.files.get('poster_file')
    if poster_file and poster_file.filename != '':
        movie_folder = os.path.join(MOVIES_ROOT, movie_id)
        poster_path = os.path.join(movie_folder, 'poster.jpg')
        poster_file.save(poster_path)
        movie['poster'] = f'movies/{movie_id}/poster.jpg'

    save_movies(movies)
    flash(f'Movie \"{title}\" updated successfully.', "success")
    return redirect(url_for('admin_panel'))

@app.route('/search')
def search_movies():
    q = request.args.get('q', '').lower()
    movies = load_movies()
    if q:
        filtered = [m for m in movies if q in m['title'].lower() or any(q in g.lower() for g in m.get('genres', []))]
    else:
        filtered = movies
    return jsonify(filtered)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
