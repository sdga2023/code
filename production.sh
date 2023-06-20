#!/bin/bash
rm -rf build;


node --max_old_space_size=8192 ./node_modules/vite/bin/vite.js build --mode $1;
touch ./build/.nojekyll;

mkdir ./build/goals
src_dir="./build"
dest_dir="./build/goals"
# Loop through the 17 goal files
for i in {1..17}; do
  # Find the HTML file with the corresponding goal number
  src_file="$(find "$src_dir" -type f -iname "goal-${i}-*.html")"
  src_folder="$(find "$src_dir" -type f -iname "goal-${i}-*.html" -exec basename {} .html \;)"
  
  # If the file is found, copy it to the destination directory with the new name
  if [ -n "$src_file" ]; then
    # create a separate folder with an index.html:
    mkdir "${src_dir}/${src_folder}"
    dest_file="${src_dir}/${src_folder}/index.html"
    cp "$src_file" "$dest_file"

    dest_file="${dest_dir}/goal$(printf "%02d" $i).html"
    cp "$src_file" "$dest_file"
  
    echo "Copied ${src_file} to ${dest_file}"
  else
    echo "File for goal ${i} not found"
  fi
done
