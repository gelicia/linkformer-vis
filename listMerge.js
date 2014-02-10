var data1 = '';//facebook data stream
var data2 = '';//linkedin data stream

var masterList = [];

data1.data.map(
  function(d){
    var obj = {};
    obj.firstName = d.first_name;
    obj.lastName = d.last_name;
    obj.location = d.current_location.name;
    obj.network = 'facebook';
    
    if(d.work.length > 0){
      obj.work = [];
      d.work.map(function(dw){
        obj.work.push(dw.employer.name);
      });
    } 
    
    if(d.education.length > 0){
      obj.school = [];
      d.education.map(function(dw){
        obj.school.push(dw.school.name);
      });
    }  
     
    masterList.push(obj);
});
 
data2.people.values.map(
  function(d){
    var obj = {};
    obj.firstName = d.firstName;
    obj.lastName = d.lastName;
    obj.location = d.location.name;
    obj.distance = d.distance;
    obj.network = 'linkedin';
     
    if(d.positions.values.length > 0){
      obj.work = [];
      d.positions.values.map(function(dw){
        obj.work.push(dw.company.name);
      });
    }   
     
    masterList.push(obj);
});

console.log(JSON.stringify(masterList));

 


