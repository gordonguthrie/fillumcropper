#!/usr/bin/env python3
import cgi
import os
import sys
import datetime
import re
import cgitb

# Enable detailed CGI error reporting
cgitb.enable(display=0, logdir="/tmp")

# Set up logging
log_file = "/tmp/upload.log"
with open(log_file, "w") as log:
    log.write(f"Starting upload process at {datetime.datetime.now()}\n")

    # Print the HTTP header
    print("Content-type: text/html\n")

    try:
        # Create uploads directory if it doesn't exist
        upload_dir = "/home/gordon/fillumcropper/uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Debug environment variables
        log.write(f"Content-Type: {os.environ.get('CONTENT_TYPE', 'Not set')}\n")
        log.write(f"Content-Length: {os.environ.get('CONTENT_LENGTH', 'Not set')}\n")

        # Parse the form data with explicit maximum size
        form = cgi.FieldStorage(keep_blank_values=True)
        
        log.write(f"Form keys: {list(form.keys())}\n")
        
        # Get the uploaded file
        if 'image' not in form:
            log.write("No 'image' field in form\n")
            raise Exception("No file field named 'image' in the form")
            
        fileitem = form['image']
        
        # Test if the file was uploaded
        if fileitem.filename:
            # Get the filename and sanitize it
            original_filename = os.path.basename(fileitem.filename)
            log.write(f"Original filename: {original_filename}\n")
            
            # Extract base name and extension
            base_name, ext = os.path.splitext(original_filename)
            log.write(f"Extension: {ext}\n")
            base_name = re.sub(r'[^A-Za-z0-9._-]', '', base_name)
            
            # Generate a unique filename with timestamp
            timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            safe_filename = f"{timestamp}_{base_name}{ext}"
            log.write(f"Safe filename: {safe_filename}\n")
            
            # Check if fileitem has a file attribute
            if not hasattr(fileitem, 'file'):
                log.write("fileitem has no file attribute\n")
                raise Exception("Uploaded item is not a file")
                
            # Save the file
            output_file = os.path.join(upload_dir, safe_filename)
            
            # Get file data
            file_data = fileitem.file
            
            # Check if file_data is None
            if file_data is None:
                log.write("file_data is None\n")
                raise Exception("Cannot read file data")
                
            # Write file in binary mode with proper chunking
            with open(output_file, 'wb') as out_file:
                # Read in chunks to avoid memory issues with large files
                chunk_size = 64 * 1024  # 64KB chunks
                file_data.seek(0)  # Make sure we're at the beginning of the file
                
                while True:
                    chunk = file_data.read(chunk_size)
                    if not chunk:
                        break
                    out_file.write(chunk)
            
            # Verify file was written correctly
            if os.path.exists(output_file):
                file_size = os.path.getsize(output_file)
                log.write(f"File saved to: {output_file} (Size: {file_size} bytes)\n")
                
                if file_size == 0:
                    log.write("WARNING: File size is 0 bytes\n")
            else:
                log.write(f"ERROR: File was not created at {output_file}\n")
            
            # Redirect back to the main page
            print(f"""
            <html>
            <head>
                <meta http-equiv="refresh" content="0;url=/?image={safe_filename}">
            </head>
            <body>
                Upload successful. Redirecting...
            </body>
            </html>
            """)
        else:
            log.write("No file was uploaded (empty filename)\n")
            print("""
            <html>
            <body>
                <h1>Error: No file was uploaded</h1>
                <p><a href="/">Back to upload form</a></p>
            </body>
            </html>
            """)
    
    except Exception as e:
        import traceback
        log.write(f"Error: {str(e)}\n")
        log.write(traceback.format_exc())
        print(f"""
        <html>
        <body>
            <h1>Error during upload</h1>
            <p>{str(e)}</p>
            <p><a href="/">Back to upload form</a></p>
        </body>
        </html>
        """)
