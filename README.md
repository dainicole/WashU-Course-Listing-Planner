# CSE330 Final Project: Course Listing Planner

Course Listing Planner is a WashU computer science course planner. It helps students decide which courses to prioritize by showing prerequisite and postrequisite relationships. For example, a student interested in CSE 417 can see that it may require Matrix Algebra, which may itself require calculus. Students can also see which later courses depend on a course such as CSE 361.

## Live Application
[https://course-listing-planner-qbvehq5vt-nicole-1bf4.vercel.app/](https://course-listing-planner-74ctulpko-nicole-1bf4.vercel.app/)

## Features

- Browse course numbers, titles, descriptions, and prerequisite information.
- Search for courses by title or course number.
- Sort courses alphabetically or by course number.
- Reverse the sort order between ascending and descending.
- Filter courses by taken or not taken status.
- Filter courses by wanted or not wanted status.
- Mark courses as taken or as courses the student wants to take.
- Select a major and track progress toward its required core courses.
- Toggle between list view and graph view.
- View prerequisite and postrequisite trees for individual courses.
- Toggle between light mode and dark mode.
- Pan and zoom the full course graph with the mouse or trackpad.
- Use graph controls to zoom in, zoom out, or reset the graph view.
- See taken and wanted courses represented with different graph node colors.

## Technologies

- React for the frontend
- Next.js for the application and API route
- Neo4j for course and prerequisite data
- Python and BeautifulSoup for web scraping
- D3 and d3-dag for graph layout and interaction
- Vercel for deployment
