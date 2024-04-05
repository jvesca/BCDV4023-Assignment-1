// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

contract BugTracker {
    enum BugPriority { Low, Medium, High}

    struct Bug{
        string id;
        string description;
        BugPriority priority;
        bool isDone;
    }
    mapping(address => Bug[]) private Users;

    function addBug(string calldata _id, string calldata _description, uint8 _priority) external {
        require(_priority >= 0 && _priority <=2, "Invalid Priority");
        Users[msg.sender].push(Bug({id: _id, description: _description, priority: BugPriority(_priority), isDone: false}));
    }

    function getTask(uint256 _bugIndex) external view returns (Bug memory){
        Bug storage bug = Users[msg.sender][_bugIndex];
        return bug;
        
  }

    function updateBugStatus(uint256 _bugIndex, bool _status) external {
        Users[msg.sender][_bugIndex].isDone = _status;
    }

    function deleteTask(uint256 _bugIndex) external{
        delete (Users[msg.sender][_bugIndex]);
    }

    function getBugCount() external view returns(uint256){
        return Users[msg.sender].length;
    }
}