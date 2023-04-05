#!/bin/bash
#
# script to make a clean repo on new diectory
# parameters:
# base_dir
# subdir (must be empty or non-exist)

test_workspaces_base_dir="$1"
test_workspace_id="$2"

if [ ! "$test_workspace_id" = "" ]; then
  test_workspace_dir="$test_workspaces_base_dir/$test_workspace_id"
else
  test_workspace_dir="$test_workspaces_base_dir"
fi

echo "test_workspace_dir $test_workspace_dir"

if [ ! -d "$test_workspaces_base_dir" ]; then
  echo "Creating base folder"
  mkdir -p "$test_workspaces_base_dir"
fi

if [ ! -d "$test_workspace_dir" ]; then
  echo "Creating folder"
  mkdir -p "$test_workspace_dir"
fi

num_files=$(find "$test_workspace_dir" -type f | wc -l) || 0
num_folders=$(find "$test_workspace_dir" -type d -not -wholename "$test_workspace_dir" | wc -l) || 0

echo "num files $num_files"
echo "num_folders $num_folders"
num_results=$((num_files + num_folders))
echo "num_results $num_results"

if [ ! "$num_results" -eq 0 ]; then
    echo "the folder is not empty"
    exit 1
fi

# else, init git repo

cwd="$pwd"
cd "$test_workspace_dir"
git init
cd "$cwd"




