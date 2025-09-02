#!/bin/bash

# Judge0 Cgroup Setup Script for WSL2/Docker
# This script sets up cgroup v1 which is required by Judge0's isolate sandbox

echo "Setting up cgroups for Judge0..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "This script must be run as root (use sudo)"
    exit 1
fi

# Create cgroup root directory
mkdir -p /sys/fs/cgroup

# Check if cgroup is already mounted
if mountpoint -q /sys/fs/cgroup; then
    echo "Cgroup root is already mounted"
else
    echo "Mounting cgroup root..."
    mount -t tmpfs cgroup_root /sys/fs/cgroup
fi

# List of cgroup subsystems needed by isolate
CGROUP_SUBSYSTEMS=(
    "memory"
    "cpuset" 
    "pids"
    "cpuacct"
    "cpu"
    "devices"
    "freezer"
    "net_cls"
    "blkio"
    "perf_event"
    "net_prio"
)

# Mount each cgroup subsystem
for subsystem in "${CGROUP_SUBSYSTEMS[@]}"; do
    CGROUP_DIR="/sys/fs/cgroup/$subsystem"
    
    if mountpoint -q "$CGROUP_DIR"; then
        echo "Cgroup $subsystem is already mounted"
    else
        echo "Setting up cgroup: $subsystem"
        mkdir -p "$CGROUP_DIR"
        
        # Try to unmount if already mounted somewhere else
        if mountpoint -q "$CGROUP_DIR"; then
            umount "$CGROUP_DIR" 2>/dev/null || true
        fi
        
        # Mount the cgroup subsystem
        if mount -t cgroup -o "$subsystem" cgroup "$CGROUP_DIR" 2>/dev/null; then
            echo "✓ Successfully mounted $subsystem"
        elif [ -d "$CGROUP_DIR" ] && [ "$(ls -A $CGROUP_DIR 2>/dev/null)" ]; then
            echo "⚠ $subsystem: already mounted elsewhere, checking if accessible..."
            if [ -w "$CGROUP_DIR/tasks" ] 2>/dev/null; then
                echo "✓ $subsystem: accessible and writable"
            else
                echo "✗ $subsystem: not writable"
            fi
        else
            echo "✗ Failed to mount $subsystem"
        fi
    fi
done

# Set proper permissions
echo "Setting permissions..."
chmod 755 /sys/fs/cgroup
for subsystem in "${CGROUP_SUBSYSTEMS[@]}"; do
    chmod 755 "/sys/fs/cgroup/$subsystem" 2>/dev/null || true
done

# Verify cgroup setup
echo ""
echo "Verifying cgroup setup:"
echo "------------------------"
for subsystem in "${CGROUP_SUBSYSTEMS[@]}"; do
    if mountpoint -q "/sys/fs/cgroup/$subsystem"; then
        echo "✓ $subsystem: mounted"
    else
        echo "✗ $subsystem: not mounted"
    fi
done

echo ""
echo "Cgroup setup completed!"
echo ""
echo "Note: You may need to restart your Docker containers after running this script."
