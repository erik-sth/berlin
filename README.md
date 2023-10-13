# Project Name

## Overview

This project facilitates efficient item allocation to students based on specified criteria. It utilizes a priority queue and a directed graph to optimize the allocation process, ensuring a streamlined and effective solution.

## Table of Contents

1. [Introduction](#introduction)
2. [Components](#components)
   - [Classes](#classes)
   - [Data Structures](#data-structures)
   - [Functions](#functions)
3. [Usage](#usage)
4. [Commands](#commands)
   - [Installation](#installation)
   - [Testing](#testing)
   - [Build](#build)
   - [Start](#start)
5. [Notes](#notes)
6. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation-1)
7. [Contributing](#contributing)
8. [License](#license)
9. [Acknowledgments](#acknowledgments)

## Introduction

Provide a brief introduction to the project, its goals, and the problems it solves.

## Components

1. **TimeDistributionAlg**: Distributes every student to a path

### Classes

1. **PriorityQueue**: Implementation of a priority queue to prioritize students based on extra items they can accommodate.
2. **DirectedGraph**: Graph representation for modeling relationships between items.
3. **GraphNode**: Represents a node in the directed graph, corresponding to an item.

### Data Structures

1. **Item**: Represents an item that students can be allocated to.
2. **PollQuestion**: Represents a poll question to gather information about students' preferences.
3. **Project**: Represents the overall project, including items required for all students.
4. **Student**: Represents a student, including information about the student and items they are already allocated.
5. **Groups**: Represent every individual id groups with all available paths with their students.

### Functions

1. **createGraph()**: Builds a directed graph based on provided items, creating edges between items with suitable time gaps.
2. **buildGroupsWithSamePaths()**:Finds every Poll Combination and returns groups
3. **findPathsForEachGroup()**: Finds every possible Path for each group
4. **allocateGroupsToItems()**: Allocates the groups to the items.
5. **distributeGroupsToPaths()**: Distributes every group to the individual paths and then checks every id
6. **getDefaultIds()**: Returns a list of item IDs required for all students.
7. **getVotingIds(studentId)**: Retrieves a list of extra item IDs based on a student's polls, caching the result for efficiency.

## Usage

Provide instructions on how to use the project. Include examples, if applicable.

## Commands

### Installation

Run the following command to install the project dependencies:

```bash
npm install
```

### Testing

Execute the following command to run tests:

```bash
npm test
```

### Build

To build the project, use:

```bash
npm run build
```

### Start

To start the project, use:

```bash
npm start
```

## Notes

- Mention any assumptions, key strategies, and efficiency considerations.
- Highlight any customization options or parameters that users might want to adjust.

## Getting Started

### Prerequisites

List any prerequisites or dependencies that users need to have installed.

### Installation

Provide step-by-step instructions on how to install and set up the project.

## Contributing

Outline guidelines for contributing to the project. Include information on how to submit issues, suggest improvements, and propose new features.

## License

Only personal use.

## Acknowledgments

Give credit to any third-party libraries, resources, or inspirations used in the project.
