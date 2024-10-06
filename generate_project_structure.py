import os

# Configuration constants
SCRIPT_FILE = os.path.basename(__file__)                # Script file name
START_DIR = os.path.dirname(os.path.abspath(__file__))  # Directory of the script
OUTPUT_FILE = 'project_structure.txt'                   # Output file name
PROJECT_IGNORE_FILE = '.projectignore'                  # File listing ignored patterns
PROJECT_HEADER_FILE = '.projectheader'                  # Optional header file
PROJECT_FOOTER_FILE = '.projectfooter'                  # Optional footer file
INDENT_CHAR = '\t'                                      # Indentation character
ARROW = '->'                                            # Arrow symbol for structure display
IGNORE_HIDDEN_FILES = False                             # Toggle for ignoring hidden files
EMPTY_FILE_PLACEHOLDER = '[not yet implemented]'        # Placeholder for empty files
OMITTED_TEXT = '[omitted for brevity]'                  # Text for ignored entries
MAX_FILE_SIZE = 1000000                                 # Max file size (bytes) before content truncation

def load_ignore_patterns(file_path):
    """Load file/directory ignore patterns from a specified file, excluding certain system files."""
    patterns = set()
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    patterns.add(line)
    return patterns

def write_structure(root_dir, output_file):
    """Generate and write the project directory structure and file contents to the output file."""
    ignore_patterns = load_ignore_patterns(os.path.join(root_dir, PROJECT_IGNORE_FILE))

    structure_lines = []  # Lines representing the directory structure
    content_lines = []  # Lines representing file contents
    collect_structure_and_contents(root_dir, structure_lines, content_lines, 0, ignore_patterns, root_dir)

    header_content = read_optional_file(os.path.join(root_dir, PROJECT_HEADER_FILE))
    footer_content = read_optional_file(os.path.join(root_dir, PROJECT_FOOTER_FILE))

    with open(output_file, 'w', encoding='utf-8') as f:
        if header_content:
            f.write(header_content + '\n\n---\n\n')
        f.write('Project Repository Structure:\n\n')
        for line in structure_lines:
            f.write(line + '\n')
        f.write('\n---\n\n')
        for line in content_lines:
            f.write(line + '\n')
        if footer_content:
            f.write(footer_content + '\n')

def read_optional_file(file_path):
    """Read content from an optional file if it exists."""
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read().strip()
    return ''

def collect_structure_and_contents(current_dir, structure_lines, content_lines, indent_level, ignore_patterns, root_dir):
    """Recursively collect directory structure and file contents, excluding system files."""
    entries = os.listdir(current_dir)
    entries = [e for e in entries if not (IGNORE_HIDDEN_FILES and e.startswith('.'))]
    dirs, files = [], []
    
    # Separate directories and files, exclude specific system files
    for entry in entries:
        entry_path = os.path.join(current_dir, entry)
        if os.path.isdir(entry_path):
            dirs.append(entry)
        elif os.path.isfile(entry_path) and entry not in {SCRIPT_FILE, OUTPUT_FILE, PROJECT_IGNORE_FILE, PROJECT_HEADER_FILE, PROJECT_FOOTER_FILE}:
            files.append(entry)

    dirs.sort()
    files.sort()

    # Process directories
    for dir_entry in dirs:
        dir_path = os.path.join(current_dir, dir_entry)
        relative_dir_path = os.path.relpath(dir_path, root_dir)
        if any_match(relative_dir_path, ignore_patterns):
            structure_lines.append(INDENT_CHAR * indent_level + ARROW + ' ' + dir_entry)
            structure_lines.append(INDENT_CHAR * (indent_level + 1) + ARROW + ' ' + OMITTED_TEXT)
        else:
            structure_lines.append(INDENT_CHAR * indent_level + ARROW + ' ' + dir_entry)
            collect_structure_and_contents(dir_path, structure_lines, content_lines, indent_level + 1, ignore_patterns, root_dir)

    # Process files
    for file_entry in files:
        file_path = os.path.join(current_dir, file_entry)
        relative_file_path = os.path.relpath(file_path, root_dir)
        structure_lines.append(INDENT_CHAR * indent_level + ARROW + ' ' + file_entry)
        collect_file_content(file_path, content_lines, relative_file_path, any_match(relative_file_path, ignore_patterns))

def collect_file_content(file_path, content_lines, relative_file_path, is_ignored):
    """Collect file contents or placeholder based on file size and ignore patterns."""
    content_lines.append(f"{relative_file_path.replace('/', os.sep)}:\n")
    include_file_contents(file_path, content_lines, is_ignored)
    content_lines.append('\n---\n')

def include_file_contents(file_path, content_lines, is_ignored):
    """Include file contents in the output or appropriate placeholders."""
    try:
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            content_lines.append(EMPTY_FILE_PLACEHOLDER)
        elif is_ignored:
            content_lines.append(OMITTED_TEXT)
        elif file_size > MAX_FILE_SIZE:
            content_lines.append('[File content truncated due to size limitations]')
        else:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            if not is_ignored:
                content_lines.append('```')
            content_lines.extend(content.splitlines())
            if not is_ignored:
                content_lines.append('```')
    except Exception as e:
        content_lines.append(f'[Error reading file: {e}]')

def any_match(path, patterns):
    """Check if a given path matches any ignore pattern."""
    for pattern in patterns:
        if os.path.normcase(pattern) == os.path.normcase(path):
            return True
    return False

def main():
    """Main execution: writes project structure to the output file."""
    write_structure(START_DIR, OUTPUT_FILE)
    print(f'Project structure has been written to {OUTPUT_FILE}')

if __name__ == '__main__':
    main()
