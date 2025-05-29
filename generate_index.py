import os
import json

# Base directory and the index path to ignore
base_directory = "./data"
ignore_filename = "index.json"

# Storage for all file paths
all_file_paths = []

# For each directory and files walking down from the base directory
for root, dirs, files in os.walk(base_directory):
    # For each file found
    for file in files:
        # Construct full path
        full_path = os.path.join(root, file)
        # Get relative path
        rel_path = os.path.join(base_directory,os.path.relpath(full_path, base_directory))

        # Check if we are at the base directory and should ignore a specific file
        if root == base_directory and file == ignore_filename:
            continue

        all_file_paths.append(rel_path)


# Write the end list to a file at base_directory/index.json
with open(f'{base_directory}/index.json', "w", encoding="utf-8") as f:
    json.dump(all_file_paths, f, ensure_ascii=False, indent=4)
