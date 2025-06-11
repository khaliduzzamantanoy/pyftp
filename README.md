# PyFTP Movie Server 🎬

[![Python](https://img.shields.io/badge/Python-3.7+-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-green.svg)](https://flask.palletsprojects.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/khaliduzzamantanoy/pyftp/graphs/commit-activity)

A powerful Python-based movie streaming server that provides a sleek web interface for browsing and streaming movies with comprehensive admin management capabilities. Built with Flask and designed for both personal and small-scale commercial use.

## ✨ Features

- 🎥 **High-Quality Movie Streaming**: Stream movies directly through the web interface with smooth playback
- 🖼️ **Visual Movie Gallery**: Beautiful poster displays for enhanced browsing experience
- 👨‍💼 **Advanced Admin Panel**: Secure administrative interface for complete movie management
- 📱 **Responsive Design**: Fully mobile-friendly interface that works on all devices
- 🔒 **Secure Authentication**: Robust admin login system with session management
- 📊 **JSON Database**: Lightweight, fast movie metadata storage system
- 🚀 **Production Ready**: WSGI compatible with Gunicorn for deployment
- 🎨 **Modern UI/UX**: Clean, intuitive interface with custom CSS and JavaScript

## 🔧 Requirements

- **Python 3.7+**
- **Flask 2.3.3+**
- **Werkzeug 2.3.7+**
- **Gunicorn 21.2.0+** (for production deployment)

See `requirements.txt` for complete dependency list.

## 🚀 Quick Start

### Prerequisites

Ensure you have Python 3.7+ installed on your system.

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/khaliduzzamantanoy/pyftp.git
   cd pyftp
   ```

2. **Create a virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**

   ```bash
   python app.py
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:5000`
   - For admin access, go to `http://localhost:5000/admin`

> 🎉 **That's it!** Your movie server is now running and ready to use.

## 💻 Usage

### Development Mode

Run the application in development mode with hot reload:

```bash
python app.py
```

The server will start on `http://localhost:5000` with debug mode enabled.

### Production Mode

For production deployment using Gunicorn:

```bash
# Basic production run
gunicorn --bind 0.0.0.0:8000 wsgi:app

# Advanced production with multiple workers
gunicorn --bind 0.0.0.0:8000 --workers 4 --timeout 300 wsgi:app
```

### Docker Deployment 🐳

```bash
# Build the image
docker build -t pyftp-server .

# Run the container
docker run -p 8000:8000 -v $(pwd)/static/movies:/app/static/movies pyftp-server
```

## 🎬 Managing Movies

### Adding Movies

To add a new movie to your server:

1. **Create Movie Directory**

   ```bash
   mkdir "static/movies/your_movie_name"
   ```

2. **Add Required Files**

   - `movie.mp4` - Your movie file (supports various formats)
   - `poster.jpg` - Movie poster image (JPG/PNG)
   - `title.txt` - Movie title (plain text file)

3. **Update Movie Database**
   Edit `data/movies.json` with the new movie metadata:

   ```json
   {
     "id": "doraemon_the_movie_nobitas_sky_utopia_hindi__japanese",
     "title": "Doraemon the Movie Nobitas Sky Utopia (Hindi & Japanese)",
     "rating": "6.7",
     "language": "Hindi + Japanese",
     "duration": "1h 47m",
     "genres": ["Drama", "Adventure"],
     "top_rated": false,
     "poster": "movies/doraemon_the_movie_nobitas_sky_utopia_hindi__japanese/poster.jpg"
   }
   ```

4. **Restart Server**

   ```bash
   # Development
   python app.py

   # Production
   sudo systemctl restart pyftp-server
   ```

### Supported Formats

- **Video**: MP4, AVI, MKV, MOV, WMV
- **Images**: JPG, JPEG, PNG, WebP
- **Subtitles**: SRT, VTT (place in movie folder)

> 💡 **Pro Tip**: Use descriptive folder names without spaces for better URL compatibility.

## 🔐 Admin Panel

Access the powerful admin interface at `/admin` to manage your movie server:

### Admin Features

- 📊 **Dashboard**: Overview of total movies, storage usage, and server stats
- ➕ **Add Movies**: Upload and add new movies with metadata
- ✏️ **Edit Movies**: Modify movie information, posters, and descriptions
- 🗑️ **Delete Movies**: Remove movies and associated files
- ⚙️ **Server Settings**: Configure server parameters and preferences
- 👥 **User Management**: Handle admin users and permissions
- 📈 **Analytics**: View streaming statistics and popular content

### Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin`

> ⚠️ **Security Notice**: Change default credentials immediately after first login!

## ⚙️ Configuration

### Environment Variables

Configure your application using environment variables:

```bash
# Application Settings
FLASK_ENV=production                    # development or production
SECRET_KEY=your-super-secret-key-here   # Generate a strong secret key
DEBUG=False                             # Enable/disable debug mode

# Admin Settings
ADMIN_USERNAME=your_admin_username      # Custom admin username
ADMIN_PASSWORD=your_secure_password     # Strong admin password

# Server Settings
HOST=0.0.0.0                           # Server host
PORT=5000                              # Server port
MAX_CONTENT_LENGTH=5368709120          # Max upload size (5GB)

# Database Settings
MOVIES_DB_PATH=data/movies.json        # Movies database file path
UPLOAD_FOLDER=static/movies            # Movies upload directory
```

### Custom Configuration

Modify `app.py` to customize advanced settings:

```python
# Server Configuration
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024 * 1024  # 5GB max file size
app.config['UPLOAD_FOLDER'] = 'static/movies'
app.config['ALLOWED_EXTENSIONS'] = {'mp4', 'avi', 'mkv', 'mov'}

# Security Configuration
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_TYPE'] = 'filesystem'
```

## 🔌 API Reference

### Public Endpoints

| Method | Endpoint             | Description              | Parameters                   |
| ------ | -------------------- | ------------------------ | ---------------------------- |
| `GET`  | `/`                  | Main movie browsing page | None                         |
| `GET`  | `/movie/<movie_id>`  | Stream specific movie    | `movie_id`: Movie identifier |
| `GET`  | `/poster/<movie_id>` | Get movie poster         | `movie_id`: Movie identifier |
| `GET`  | `/search`            | Search movies            | `q`: Search query            |

### Admin Endpoints

| Method   | Endpoint                  | Description          | Auth Required |
| -------- | ------------------------- | -------------------- | ------------- |
| `GET`    | `/admin`                  | Admin login page     | No            |
| `POST`   | `/admin/login`            | Admin authentication | No            |
| `GET`    | `/admin/panel`            | Admin dashboard      | Yes           |
| `POST`   | `/admin/upload`           | Upload new movie     | Yes           |
| `PUT`    | `/admin/movie/<movie_id>` | Update movie info    | Yes           |
| `DELETE` | `/admin/movie/<movie_id>` | Delete movie         | Yes           |
| `GET`    | `/admin/stats`            | Server statistics    | Yes           |

### API Response Format

```json
{
  "status": "success|error",
  "data": {...},
  "message": "Response message",
  "timestamp": "2025-06-11T10:30:00Z"
}
```

## 🛡️ Security Features

- 🔐 **Session-based Authentication**: Secure admin login with session management
- 🛡️ **CSRF Protection**: Cross-site request forgery protection
- 📁 **File Type Validation**: Strict file type checking for uploads
- 🔒 **Secure File Handling**: Safe file upload and storage mechanisms
- 🧹 **Input Sanitization**: All user inputs are sanitized and validated
- 🚫 **Path Traversal Protection**: Prevents directory traversal attacks
- 🔑 **Secret Key Management**: Secure session key configuration

## 🚀 Production Deployment

### Option 1: Gunicorn + Nginx

1. **Install Gunicorn**

   ```bash
   pip install gunicorn
   ```

2. **Create systemd service** (`/etc/systemd/system/pyftp.service`):

   ```ini
   [Unit]
   Description=PyFTP Movie Server
   After=network.target

   [Service]
   User=www-data
   Group=www-data
   WorkingDirectory=/path/to/pyftp
   Environment="PATH=/path/to/pyftp/venv/bin"
   ExecStart=/path/to/pyftp/venv/bin/gunicorn --workers 4 --bind unix:pyftp.sock -m 007 wsgi:app
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

3. **Configure Nginx** (`/etc/nginx/sites-available/pyftp`):

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       client_max_body_size 5G;

       location / {
           include proxy_params;
           proxy_pass http://unix:/path/to/pyftp/pyftp.sock;
           proxy_read_timeout 300s;
           proxy_connect_timeout 75s;
       }

       location /static {
           alias /path/to/pyftp/static;
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

### Option 2: Docker Deployment 🐳

1. **Create Dockerfile**:

   ```dockerfile
   FROM python:3.9-slim

   WORKDIR /app

   # Install system dependencies
   RUN apt-get update && apt-get install -y \
       ffmpeg \
       && rm -rf /var/lib/apt/lists/*

   # Copy and install Python dependencies
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   # Copy application code
   COPY . .

   # Create non-root user
   RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
   USER appuser

   EXPOSE 8000
   CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "wsgi:app"]
   ```

2. **Create docker-compose.yml**:

   ```yaml
   version: "3.8"
   services:
     pyftp:
       build: .
       ports:
         - "8000:8000"
       volumes:
         - ./static/movies:/app/static/movies
         - ./data:/app/data
       environment:
         - FLASK_ENV=production
         - SECRET_KEY=your-production-secret-key
       restart: unless-stopped
   ```

3. **Deploy**:
   ```bash
   docker-compose up -d
   ```

### Option 3: Cloud Deployment ☁️

#### Heroku

```bash
# Install Heroku CLI and login
heroku create your-app-name
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=your-secret-key
git push heroku main
```

#### AWS EC2

```bash
# Launch EC2 instance and connect
sudo apt update && sudo apt install python3-pip nginx
git clone https://github.com/khaliduzzamantanoy/pyftp.git
cd pyftp
pip3 install -r requirements.txt
# Configure nginx and systemd as shown above
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Bug Reports**: Found a bug? Open an issue with detailed reproduction steps
- 💡 **Feature Requests**: Have an idea? We'd love to hear it!
- 🔧 **Code Contributions**: Submit pull requests for bug fixes or new features
- 📖 **Documentation**: Help improve our documentation
- 🎨 **UI/UX Improvements**: Make the interface even better

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/pyftp.git
   cd pyftp
   ```

2. **Create Development Environment**

   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # Development dependencies
   ```

3. **Create Feature Branch**

   ```bash
   git checkout -b feature/amazing-new-feature
   ```

4. **Make Changes and Test**

   ```bash
   python app.py  # Test your changes
   ```

5. **Submit Pull Request**
   ```bash
   git add .
   git commit -m "Add amazing new feature"
   git push origin feature/amazing-new-feature
   ```

### Code Style Guidelines

- Follow PEP 8 for Python code
- Use meaningful variable and function names
- Add comments for complex logic
- Write docstrings for functions and classes
- Test your changes thoroughly

### Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update the changelog
5. Request review from maintainers

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for complete details.

```
MIT License


```

## 👨‍💻 Author & Maintainer

**MD Khaliduzzaman Tanoy**

- 🌐 **GitHub**: [@khaliduzzamantanoy](https://github.com/khaliduzzamantanoy)
- 📧 **Email**: [Contact via GitHub](https://github.com/khaliduzzamantanoy)
- 🚀 **Project**: [PyFTP Movie Server](https://github.com/khaliduzzamantanoy/pyftp.git)
- 💼 **LinkedIn**: [Connect with me](https://linkedin.com/in/khaliduzzamantanoy)

## 🆘 Support & Help

### Getting Help

- 📚 **Documentation**: Check this README and inline code comments
- 🐛 **Issues**: [GitHub Issues](https://github.com/khaliduzzamantanoy/pyftp/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/khaliduzzamantanoy/pyftp/discussions)
- 📧 **Email**: Reach out via GitHub for complex issues

### Common Issues & Solutions

**Movie won't play?**

- Check file format compatibility (MP4 recommended)
- Verify file permissions in the movies directory
- Ensure adequate server resources

**Admin panel not accessible?**

- Verify admin credentials
- Check if session is active
- Clear browser cache and cookies

**Upload failing?**

- Check file size limits (default 5GB)
- Verify available disk space
- Ensure proper folder permissions

### Support This Project

If you find PyFTP Movie Server useful:

- ⭐ **Star** this repository on GitHub
- 🐛 **Report bugs** and suggest improvements
- 🤝 **Contribute** code or documentation
- 💬 **Share** with others who might benefit
- 📝 **Write** a review or tutorial

## 🙏 Acknowledgments

Special thanks to:

- **Flask Community** for the amazing web framework
- **Bootstrap Team** for responsive design components
- **Contributors** who help improve this project
- **Users** who provide valuable feedback and bug reports
- **Open Source Community** for inspiration and tools

---

<div align="center">

**⭐ If you find this project useful, please consider giving it a star on GitHub! ⭐**

Made with ❤️ by [MD Khaliduzzaman Tanoy](https://github.com/khaliduzzamantanoy)

</div>
