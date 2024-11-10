const {Command} = require('commander')
const program = new Command();
const mongoose = require('mongoose')

require('dotenv').config();
mongoose
.connect(process.env.MONGODB_URI)
.then(()=>console.log("Connected to DataBase successfully"))
.catch(()=>console.log("Error : could not connect to DB"))

const schema = mongoose.Schema({
    taskNo:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    }
});
const Task = mongoose.model("task",schema);
const addNewTask = async(des)=>{
    const tasks = await Task.find({});
    const taskNumbersList =tasks.map((task)=>{
        return task.taskNo;
    })
    console.log(taskNumbersList.length)
    const new_task_no = tasks.length === 0 ? 0 : Math.max(...taskNumbersList)+1
    try{
        const result = await Task.create({taskNo:new_task_no,description:des,status:"pending"})
        console.log(result)
        if(result)
            {
                console.log("Task added successfully")
                process.exit(0);
            }
    }catch(err){
        console.log("ERROR : Could not add the Task")
        process.exit(1)
    }
}
const deleteTask = async(task_no)=>{
    try{
        const result = await Task.deleteOne({taskNo:task_no})
        if(result){
            console.log("Task deleted successfully")
            process.exit(0)
        }
    }catch(err){
        console.log("ERROR : Could not delete the Task")
        process.exit(1)
    }
}
const listTasks = async(status)=>{
    try{
        let tasks = [];
        if(status === "all")
        tasks = await Task.find();
        else{
            tasks = await Task.find({status});
        }
        if(tasks.length>=1)
            {
                console.log(tasks)
                process.exit(0)
            }
        else
        {
            console.log("Error : NO task with given status");
            process.exit(1);
        }
    }catch(err){
        console.log("ERROR : Could not fetch requested Tasks")
        process.exit(1);
    }
}
const markTaskAsDone = async(task_no)=>{
    const task = await Task.findOne({taskNo:task_no})
    if(task.status === "done"){
        console.log("Task mark done successfully")
        process.exit(0)
    }
    else{
        try{
            const result = await Task.updateOne({taskNo:task_no},{status:"done"});
            if(result)
                {
                    console.log("Task mark done successfully")
                    process.exit(0)
                }
        }
        catch(err){
            console.log("ERROR : Could not change the status of the Task")
            process.exit(1)
        }

    }
}
const withinRange = async(number)=>{
   const tasks = await Task.find({});
   const numbersList = tasks.map((task)=>task.taskNo);
   const upperLimit = tasks.length === 0 ? 0 : Math.max(...numbersList);
   const lowerLimit = tasks.length === 0 ? 0 :Math.min(...numbersList);
   return number <= upperLimit && number >= lowerLimit;
}
program.name("Todo List App").description("Used as a second brain to keep track of things to do").version("1.0.0");
program
.option('--new <value>',"Add a new todo Item")
.option('--delete <taskNo>',"Delete a task using its Number")
.option('--done <taskNo>',"Update a task as done using its Number")
.option('--list <all|done|pending>',"List all or pending or done list of tasks")
.parse(process.argv)

const run = async()=>{

    const options = program.opts();
    const args = program.args;
    if(options.new){
            if(args.length> 0)
                {
                    const description = args.join(" ");
                    await addNewTask(options.new+" "+description)
                }
        else{
            console.log("Give valid description of the task")
            process.exit(1)
        }
    }
    else if(options.delete){
        const taskNo = parseInt(options.delete, 10);
        if(await withinRange(taskNo))
            await deleteTask(taskNo)
        else{
            console.log("ERROR : No task with this id")
            process.exit(1)
        }
    }
    else if(options.done){
        const taskNo = parseInt(options.done, 10);
        if(await withinRange(taskNo))
            await markTaskAsDone(taskNo)
        else{
            console.log("ERROR : No task with this id")
            process.exit(1)
        }
    }
    else if(options.list){
        if(["all","done","pending"].includes(options.list))
            await listTasks(options.list)
        else{
            console.log("Give valid status of the task")
            process.exit(1)
        }
    }
    else{
        console.log("No option selected")
        process.exit(1)
    }

}

run();