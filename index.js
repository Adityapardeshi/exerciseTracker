const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
const {Schema} = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config()

app.use(bodyParser.urlencoded({ extended: false }))

const mongo_uri = "mongodb+srv://aditya:Aditya%401234@cluster0.a11i2ok.mongodb.net/exercise?retryWrites=true&w=majority;"

mongoose.connect(mongo_uri);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const userSchema = new Schema({
  username: {
     type: String,
     required: true
  },
  log: [{
    date: String,
   duration: Number,
    description: String
  }],
  count: Number
})

const User = new mongoose.model('User', userSchema);



app.route('/api/users')
  .post((req, res)=>{
  username = req.body.username;
  const user = new User({username, count:0});
  user.save((err, data)=>{
    if(err) return console.log(err);
    else res.json(data);
    console.warn("post");
  });
})
  .get((req, res)=>{
    User.find((err, data)=>{
      if(err) return console.error(err);
      else res.send(data);
       console.warn("get");
    })
  })


 function convertDate(date) {

    const d = ['Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = d[new Date(date).getDay()];
    const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const month = m[new Date(date).getMonth()]
    let diwas = new Date(date).getDate();
    if(diwas<10) diwas = ('0' + diwas).slice(-2);
    const year = new Date(date).getFullYear();
    
    const convertedDate = day+" "+month+" "+diwas+" "+year
    
    return convertedDate;
  }


app.post('/api/users/:_id/exercises', (req, res)=>{
  const {description} = req.body;
  const duration = parseInt(req.body.duration);
  
 
  const date = req.body.date ? convertDate(req.body.date) : 'Fri Aug 19 2022';
  //hardcoded date

  const id = req.params._id;

   const exercise = {
        date,  
        duration,
        description,
      };

  User.findByIdAndUpdate(id, {$push: {log: exercise}, $inc:{count: 1}},{new: true}, (err, user)=>{
    if(user){
      const UpdatedExercise = {
        _id : id,
        username: user.username,
        ...exercise
      }
      //console.log(user);
    res.json(UpdatedExercise);
    }
    
  })
})

app.get('/api/users/:_id/logs', (req, res)=>{

  let {from, to, limit} = req.query;
  console.log(from, to, limit);

  from = convertDate(from);
  to = convertDate(to);
      
  User.findById(req.params._id, (err, user)=>{
      if(user){
        if(from || to || limit){
        
          if(limit){
           
            const getlog = user.log;
             let j = getlog.length-1;
             let logs = []
            
            for(let i = 0; i < getlog.length; i++){
              logs[j] = getlog[i];
              j--;
            }
            const filteredLogs = logs
              .filter(log => {
                const formatedLogDate = (new Date(log.date)).toISOString().split('T')[0]
                return true
              })
          
          const slicedLog = limit ? filteredLogs.slice(0, limit) : filteredLogs;
            
          user.log = slicedLog
          }
          
          if(from){
            let slicedLog = [];
            var allLog = user.log;
            let j = allLog.length-1;
            let logs = []
            
            if(!limit == true){
               const getlog = user.log;
               let j = getlog.length-1;

              for(let i = 0; i < getlog.length; i++){
                logs[j] = getlog[i];
                //console.log(getlog[i]+"geltog")
                //console.log(logs[j]+"tog")
                j--;
              }
              allLog = logs;
            }
            console.log(allLog.length)
            //let j = allLog.length;
            for(let i = 0; i < allLog.length; i++){
              let a = allLog[i].date;
              let unix = Math.floor(new Date(a).getTime() / 1000);
              const from_unix = Math.floor(new Date(from).getTime() / 1000);
              
              if(unix >= from_unix){
                slicedLog[i] = allLog[i];
                
                 user.log = slicedLog;   
               // j--;
              }
            }  
          }
         if (to) {
           let slicedLog = [];
            var allLog = user.log;
           //let j = allLog.length;
            let j = allLog.length-1;
            let logs = []
           
            if(!limit || !from ){
             const getlog = user.log;
               let j = getlog.length-1;

              for(let i = 0; i < getlog.length; i++){
                logs[j] = getlog[i];
                //console.log(getlog[i]+"geltog")
                //console.log(logs[j]+"tog")
                j--;
              }
              allLog = logs;
            }
           
            for(let i = 0; i < allLog.length; i++){
              let a = allLog[i].date;
              let unix = Math.floor(new Date(a).getTime() / 1000);
              const to_unix = Math.floor(new Date(to).getTime() / 1000);
              if(unix <= to_unix){
                slicedLog[i] = allLog[i];
                 user.log = slicedLog; 
                //j--;
              }
            }  
         }
        }
       
        
       
        
        let c = parseInt(limit ? limit : user.count);
        
        const user_test = {
          "_id": user._id,
          "username": user.username,
          "from": from,
          "to": to,
          "count": c,
          "log": user.log
        }
        //console.log(user_test);
        console.log(user.log)
        res.json(user_test);
      } 
      else console.log("fu")
  });
})
        
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
