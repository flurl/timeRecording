timeRecording
=============
A web based time clock build with django

Setup
-----
###install the dependencies
    apt install python3 python3-venv
###clone the repository and set up the venv
    git clone https://github.com/flurl/timeRecording.git
    cd timeRecording/
    pyvenv venv
    pip install wheel
###setup the database
    python manage.py makemigrations
    python manage.py migrate
    python manage.py createsuperuser
###start the server
    python manage.py runserver IP:PORT

> Written with [StackEdit](https://stackedit.io/).
