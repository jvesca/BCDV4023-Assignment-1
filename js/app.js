// jQuery is a JS library designed to simplify working with the DOM (Document Object Model) and event handling.
// This code runs the function createBugList() only after the DOM has completely loaded, ensuring safe DOM element interaction.
$(document).ready(createBugList());

//auto focus on input of add task modal
$('#add-bug-container').on('shown.bs.modal', function () {
    $('#new-bug').trigger('focus');
});

async function createBugList() {
    // Get first account provided by Ganache
    try {
        await getAccount();
        contract = new web3.eth.Contract(contractABI, contractAddress);
        console.log( 'this is the contractAddress:' +contractAddress);
        
        try {
            bugNum = await contract.methods
                .getBugCount() //Changed From getTaskCount to getBugCount
                .call({
                    from: web3.eth.defaultAccount
                });
            // If there is at least one bug present...
            if (bugNum != 0) {
                // fetch all of the bugs and create the list to display
                let bugIndex = 0;
                
                
                while (bugIndex < bugNum) {
                    try {
                        let bug = await contract.methods
                            .getTask(bugIndex) //Change from getBug to getTask, should be similar to solidity code
                            .call({
                                from: web3.eth.defaultAccount
                            });
                            
                        if (bug.id != '') {
                            // addBugToList adds a bug as a child of the <ul> tag
                            addBugToList(bugIndex, bug.description, bug.isDone);
                        } else {
                            console.log('The index is empty: ' + bugIndex);
                        }
                    } catch {
                        console.log('Failed to get bug: ' + bugIndex);
                    }
                    bugIndex++;
                }
                // update the bug count
                // updateBugCount();
                console.log("Bug Count: " + await contract.methods
                .getBugCount() //Changed From getTaskCount to getBugCount
                .call({
                    from: web3.eth.defaultAccount
                }));
                
                
            }
        } catch {
            console.log('Failed to retrieve bug count from blockchain.');
        }
    } catch {
        console.log('Failed to retrieve default account from blockchain.');
    }
}

function addBugToList(id, name, status) {
    // get the id of the <ul> then append children to it
    let list = document.getElementById('list');
    let item = document.createElement('li');
    item.classList.add(
        'list-group-item',
        'border-5',
        'd-flex',
        'justify-content-between',
        'align-items-center'
    );
    item.id = 'item-' + id;
    // add text to the <li> element
    let bugId = document.createTextNode('ID: ' + id + ' |'); // Add space after the ID
    let bug = document.createTextNode('Description: ' + name + ' |'); // Add space after the description
    let statusText = status ? 'Resolved' : 'Unresolved'; // Convert status to text
    let bugStatus = document.createTextNode('Status: ' + statusText);
    // create a checkbox and set its id and status
    var checkbox = document.createElement('INPUT');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('id', 'item-' + id + '-checkbox');
    checkbox.checked = status;
    // if status is true then add bug-done class to <li> element so that the text font has a line through
    if (status) {
        item.classList.add('bug-done');
    }
    list.appendChild(item);
    item.appendChild(bugId);
    item.appendChild(bug);
    item.appendChild(bugStatus);
    item.appendChild(checkbox);
    checkbox.onclick = function () {
        changeBugStatus(checkbox.id, id);
    };
}


// change the status of the bug stored on the blockchain
async function changeBugStatus(id, bugIndex) {
    // get checkbox element
    let checkbox = document.getElementById(id);
    // get the id of the <li> element
    let textId = id.replace('-checkbox', '');
    // get the <li> element
    let text = document.getElementById(textId);
    try {
        await contract.methods
            .updateBugStatus(bugIndex, checkbox.checked)
            .send({
                from: web3.eth.defaultAccount
            });
        if (checkbox.checked) {
            text.classList.add('bug-done');
            console.log('Bug status updated to resolved');
            // console.log(bugIndex); 
        } else {
            text.classList.remove('bug-done');
            console.log('Bug status updated to unresolved');
        }
    } catch (error) {
        console.log('Failed to change status of bug. Index: ' + bugIndex);
    }
}

async function addBug(id, description, priority) {
    let form = document.getElementById('add-bug-container');
    form.classList.remove('was-validated');
    // Get input values
    let idInput = document.getElementById('new-id').value;
    let descriptionInput = document.getElementById('new-bug').value;
    let priorityInput = document.getElementById('new-priority').value;
    
    // Clear input fields
    document.getElementById('new-id').value = '';
    document.getElementById('new-bug').value = '';
    document.getElementById('new-priority').value = '';

    contract.methods
        .getBugCount() 
        .call({
            from: web3.eth.defaultAccount
        })
        .then(
            (bugNum) => {
                addBugToList(bugNum, descriptionInput, false);
            },
            (err) => {
                console.log('Failed to retrieve the number of bugs from Ganache.');
            }
        );
    try {
        await contract.methods
            .addBug(idInput, descriptionInput, priorityInput)
            .send({
                from: web3.eth.defaultAccount
            });

            console.log("Bug Count after adding a new bug: " + await contract.methods
                .getBugCount() //Changed From getTaskCount to getBugCount
                .call({
                    from: web3.eth.defaultAccount
                }));
    } catch {
        console.log('Failed to save bug to blockchain.');
    }
}

// Function to delete a bug
async function deleteBug(bugIndex) {
    try {
        // Call the deleteTask function on the contract
        await contract.methods.deleteTask(bugIndex).send({ from: web3.eth.defaultAccount });
        console.log("Bug deleted successfully from blockchain!");
        
        // Remove bug from UI
        let listItem = document.getElementById('item-' + bugIndex);
        if (listItem) {
            listItem.remove();
            console.log("Bug removed from UI!");
        } else {
            console.log("Bug not found in UI!");
        }
        
    } catch (error) {
        console.error("Error deleting bug:", error);
    }
}


