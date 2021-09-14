// Required Modules
const mysql = require('mysql2');
const inquirer = require('inquirer');

const cTable = require('console.table');


// Connecting to the database
// This block of code creates the connection between the server.js to the employee_db created in schema
// If it has sucessfully connected, WHICH REQUIRES A PASSWORD, the console log prints a confirmation
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'jliao5703', // Need to insert password here
        database: 'employee_db' // This pulls from the db created in the schema.sql
    },
    console.log('Connected to the employee_db database')
);

db.connect(function (err) {
    if (err) throw err
    console.log("Connected to MySql")
    startingPrompts();
});

// The next block of codes asks whether the user would to do one of these things:
// View All Departments", "View All Roles", "View All Employees", "Add Department", "Add Role", "Add Employee?", "Update Employee Role?"
const startingPrompts = () => {
    return inquirer.prompt([
        {
            name: 'choice',
            type: 'list',
            message: 'What would you like to do?',
            choices: ['View all Departments', 
                      'View all roles', 
                      'View all Employees', 
                      'Add a Department', 
                      'Add a Role', 
                      'Add an Employee', 
                      'Update Employee Role'],
        },
    ]).then((data) => {
        // For future notes, 'val.action' is based on what inquirer where 'name:' is defined. If it was changed to another string it would be 'val.[w.e string]'
        switch (data.choice) {
            case ("View all Departments"):
                viewDepts();
                break;
            
            case "View all roles":
                viewRoles();
                break;
            
            case "View all Employees":
                viewEmployees();
                break;

            case "Add a Department":
                addDepartment();
                break;

            case "Add a Role":
                addRole();
                break;

            case "Add an Employee":
                addEmployee();
                break;

            case "Update Employee Role":
                updateEmployee();
                break;
        }   
    });
};

// These next couple blocks are code are the different choices you can pick
// These are for viewing
// For 'View all Departments'
const viewDepts = () => {
    const query = "SELECT * FROM department";
    db.query(query, function (err, res) {
        // This basically states that if there was an error in the roles
        // Like if there was no data then we start over back at the prompts
        // asking the user what they would like to do next.
        if (err) throw err
        console.table(res)
        startingPrompts()
    });
};
// For 'View all Roles'
const viewRoles = () => {
    const query = "SELECT * FROM role";
    db.query(query, function (err, res) {
        // This basically states that if there was an error in the roles
        // Like if there was no data then we start over back at the prompts
        // asking the user what they would like to do next.
        if (err) throw err
        console.table(res)
        startingPrompts();
    });
};
// // For 'View all Employees'
// // View all employees is going to be hard as i have to combine two different tables to 
// // form a single table. 
const viewEmployees = () => {
    const query = `SELECT 
                   employee.id, 
                   employee.first_name, 
                   employee.last_name, role.title, 
                   department.name AS department, 
                   role.salary, 
                   CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
                   FROM 
                   employee
                   LEFT JOIN role ON employee.role_id = role.id
                   LEFT JOIN department ON role.department_id = department.id
                   LEFT JOIN employee manager ON manager.id = employee.manager_id;`;

    db.query(query, function (err, res) {
        // This basically states that if there was an error in the roles
        // Like if there was no data then we start over back at the prompts
        // asking the user what they would like to do next.
        if (err) throw err
        console.table(res)
        startingPrompts();
    });
};

// // These next couple blocks of code allo you to modify the such as add a department 
// // employees, or roles
// // For 'Add a Department'
// The parameters needed for this function are NAME OF DEPARTMENT
const addDepartment = () => {
    inquirer.prompt([
        {
            name: "Name",
            type: "input",
            message: "What's the name of the department are you adding?"
        },
    ])
    .then(function(res) {
        const query = "INSERT INTO department SET ?";
        // 'name' in this line of code is the title of the column in this name
        db.query(query, {
            name: res.Name
            },
            function(err) {
                if (err) throw err
                console.table(res);
                startingPrompts();
            }
        );
    });
};

// // For 'Add a Role'
// // The parameters needed for this function are NAME OF ROLE, SALARY, DEPARTMENT FOR THE ROLE
const addRole = () => {

    let departmentArray = [];

    db.query("SELECT * FROM department;", (err, results) => {
        if (err) throw err;
        results.map((department) => departmentArray.push(`${department.name}`));
        return departmentArray;
    });
    
    inquirer.prompt([
        {
            name: "Title",
            type: "input",
            message: "What is the name of the Role?"
        },
        {
            name: "Salary",
            type: "input",
            message: "What is this role's Salary?"
        },
        {
            name: "Department",
            type: "list",
            message: "What department does the role belong to?",
            choices: departmentArray,
        },
    ])
    .then(function(res) {
    // 'title' in this line of code is the title or the name of the columns in the tables
        const departmentID = departmentArray.indexOf(res.Department) + 1;
        db.query(
            "INSERT INTO role SET ?", 
            {
                title: res.Title, 
                salary: res.Salary,
                department_id: departmentID
            },
            function(err) {
                if (err) throw err
                console.table(res);
                startingPrompts();
            }
        )
    });
};

// // // // For 'Add an Employee'
const addEmployee = () => {

    // These arrays will hold onto pre-establisher roles and managers
    // that can be used to select for new employees
    let managersArray = [];
    let rolesArray = [];

    // These grab the first and last names of the employee in the employee table
    // the special thing is that names that have null or no manager id are selected
    // as the null denotes someone who doesn't work under anyone.
    const query = "SELECT first_name, last_name FROM employee WHERE manager_id IS NULL";
    db.query(
        query, 
        (err, results) => {
            results.map(manager => 
                managersArray.push(`${manager.first_name} ${manager.last_name}`)
            );
            return managersArray;
        }
    );
    
    // This block of code will grab roles and in the role table and 
    // turn into a array.
    db.query("SELECT * FROM role ", (err, results) => {
        if (err) throw err;
        results.map(role => rolesArray.push(`${role.title}`));
        return rolesArray;
    })
    
    inquirer.prompt([
        {
            name: "First_name",
            type: "input",
            message: "What is the new employee's FIRST name?",
        },
        {
            name: "Last_name",
            type: "input",
            message: "What is the new employee's LAST name?",
        },
        {
            name: "Role",
            type: "list",
            message: "What is the employee's role?",
            choices: rolesArray,
        },
        {
            name: "Manager",
            type: "list",
            message: "Who is the Employee's manager?",
            choices: managersArray,
        }
    ]).then(function(res) {
        // These two lines of code will grab the ID numbers for the specific role and the
        // id of the manager. These will be used later.
        const roleID = rolesArray.indexOf(res.Role) + 1;
        const managerID = managersArray.indexOf(res.Manager) + 1;

        // This block of code creates a new object, in this case a new employee
        // the employees parameters based on the users input and the role and managers selected
        // The two variables above are used to finde the manager associated with the worker
        // and the role ID given to that specific role.
        const newEmployee = {
            first_name: res.First_name,
            last_name: res.Last_name,
            manager_id: managerID,
            role_id: roleID,
        };

        // Once the new employee is created, the object is inserted into the employee
        // database with all of its attributes in the proper column
        db.query("INSERT INTO employee SET ?", newEmployee, err => {
            if (err) throw err;
            startingPrompts();
        })
    })
};


// For 'Update Employee Role'
const updateEmployee = () => {

    // Like the two arrays above these arrays will hold onto pre-establisher roles and managers
    // that can be used to update employees based on their roles
    let employeesArray = [];
    let rolesArray = [];
    
    // This code helps gather all of the employees. It grabs the first and last name
    // of every employer since everyone is an employee
    db.query(
      "SELECT first_name, last_name FROM employee",
      (err, results) => {
        results.map(worker =>
            employeesArray.push(`${worker.first_name} ${worker.last_name}`)
        );
        return employeesArray;
      }
    );
    
    // This block of is very similar to one up where we add a new employee
    // It basically grabs everyrole in the roles table and turns it into an array
    db.query(
      "SELECT * FROM role ", (err, results) => {
      if (err) throw err;
      results.map(role => rolesArray.push(`${role.title}`));
      return rolesArray;
    })

    inquirer.prompt([
        {
            name: "confirm",
            type: "confirm",
            message: "You sure your want to update?",
        },
        {
          name: "choice",
          type: "list",
          message: "Please select the employee to update",
          choices: employeesArray,
        },
        {
            name: "role",
            type: "list",
            message: "what is the employee's new role?",
            choices: rolesArray,
        },
    ]).then(res =>{
        // These two lines of code will grab the ID numbers for the specific role and the
        // id of the employer. These will be used later.
        const roleID = rolesArray.indexOf(res.role) + 1;
        const employeeID = employeesArray.indexOf(res.choice) + 1;
        
        // The two variables above will be used here change the role id of a specific employee
        // based on  the employee's ID.
        db.query (`UPDATE employee SET role_id= ${roleID} WHERE id= ${employeeID} `, (err) =>{
          if(err) throw err;
          startingPrompts();
        })
    })
};

