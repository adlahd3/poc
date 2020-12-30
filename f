  const file = "./cr.db";
  var db = new sqlite3.Database(file, sqlite3.OPEN_READONLY);

  let y = db.serialize(function() {
    console.log('querying database');
      db.all("SELECT * FROM crs WHERE cr_number = ? LIMIT 1",[cr_number], function(err, allRows) {

          if(err != null){
            console.log('error');
              console.log(err);
          }
         
          console.log('closing the database connection');
          db.close();
        
      });
  });