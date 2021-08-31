document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);



  // By default, load the inbox
  load_mailbox('inbox');

  //Submitting an Email
  document.querySelector('#compose-form').onsubmit = function() {
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    //Posting Email (My code)
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: `${recipients}`,
          subject: `${subject}`,
          body: `${body}`
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result); 
    });
    load_mailbox('sent');

    //Stop form from submitting
    return false;
  }

  
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display='none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function reply_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display='none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = `${current_email.sender}`;
  subject = document.querySelector('#compose-subject').value;
  if(subject.charAt(0)==="R" && subject.charAt(1)==="e" && subject.charAt(2) ===":"){
    document.querySelector('#compose-subject').value = '';
  }
  document.querySelector('#compose-subject').value = `Re: ${current_email.subject}`;  
  document.querySelector('#compose-body').value = `"On ${current_email.timestamp} ${current_email.sender}  wrote: '${current_email.body}' "`
}

function archive_email(){

  document.querySelector('#emails-view').value= '';
  location.reload();
  fetch(`/emails/${current_email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })

  load_mailbox("inbox");
}

function unarchive_email(){

  document.querySelector('#emails-view').value= '';
  location.reload();
  
  fetch(`/emails/${current_email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
 
  load_mailbox("inbox");

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#single-email-view').style.display='none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  
  if(mailbox ==='inbox'){
    document.querySelector("#single-email-view").innerHTML = "";
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails => {
        // Print emails
        console.log(emails);

        // ... do something else with emails ...

        //for each element in my emails array I need to create a new div.
        emails.forEach(element => {
         
          // Find the task the user just submitted
          const email = element.value;

          // Create a list item for the new task and add the task to it
          const table = document.createElement('table');
          table.innerHTML = `<tr>
                              <td>${element.sender}</td> 
                              <td>${element.subject}</td> 
                              <td>${element.timestamp}</td>
                            </tr>`;
          
          // Add new element to our Table
          if(element.read === true){
            table.style.backgroundColor="rgb(224,224,224)";
          }
          document.querySelector('#emails-view').append(table);
          

          //Adding an event listener so that we can access a specific email once clicked
          let id = element.id;
          table.addEventListener('click', function() {
            current_email = element;
            console.log('This element has been clicked!')
            // Show the mailbox and hide other views
            document.querySelector('#single-email-view').style.display='block';
            document.querySelector('#compose-view').style.display = 'none';
            document.querySelector('#emails-view').style.display = 'none';
            fetch(`/emails/${id}`)
            .then(response => response.json())
            .then(email => {
      
                // Print email
                console.log(email);
                // Create a list item for the new task and add the task to it
                const div = document.createElement('table');
                div.innerHTML = `<tr><td id="single-email-sender"><b>From:</b> ${element.sender}</td></tr>
                                  <tr><td id="single-email-recipient"><b>To: </b> ${element.recipients}</td></tr>
                                  <tr><td id="single-email-subject"><b>Subject: </b>${element.subject}</td></tr>
                                  <tr><td id="single-email-timestamp"><b>Timestamp: </b>${element.timestamp}</td></tr>
                                  <tr><td><button type="button" id="reply-button" onclick="reply_email()"class="btn btn-sm btn-outline-primary">Reply</button></tr></td>
                                  <tr><td><button type="button" id="unarchive-button"  onclick="archive_email()"class="btn btn-sm btn-outline-primary">Archive</button></tr></td>
                                  <tr><td><hr></td></tr>
                                  <tr><td id="single-email-body">${element.body}</td></tr>`;

                fetch(`/emails/${element.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      read: true
                  })
                })
                
                
                // Add new element to our div
                document.querySelector('#single-email-view').append(div);
            });

          });
        
      });
      
    });
    
    
    
  }

  if(mailbox ==='sent'){
    location.reload();
    document.querySelector("#single-email-view").innerHTML = "";
    fetch('/emails/sent')
    .then(response => response.json())
    .then(emails => {
        // Print emails
        console.log(emails);

        // ... do something else with emails ...

        //for each element in my emails array I need to create a new div.
        emails.forEach(element => {

        // Find the task the user just submitted
        const email = element.value;

        // Create a list item for the new task and add the task to it
        const table = document.createElement('table');
        table.innerHTML = `<tr>
                            <td> To: ${element.recipients}</td> 
                            <td>${element.subject}</td> 
                            <td>${element.timestamp}</td>
                           </tr>`;

        // Add new element to our unordered list:
        document.querySelector('#emails-view').append(table);
         //Adding an event listener so that we can access a specific email once clicked
         let id = element.id;
         table.addEventListener('click', function() {
           console.log('This element has been clicked!')
           // Show the mailbox and hide other views
           document.querySelector('#single-email-view').style.display='block';
           document.querySelector('#compose-view').style.display = 'none';
           document.querySelector('#emails-view').style.display = 'none';
           fetch(`/emails/${id}`)
           .then(response => response.json())
           .then(email => {
               current_email = element;
               // Print email
               console.log(email);
               // Create a list item for the new task and add the task to it
               const div = document.createElement('table');
               div.innerHTML = `<tr><td id="single-email-sender"><b>From:</b> ${element.sender}</td></tr>
                                 <tr><td id="single-email-recipient"><b>To: </b> ${element.recipients}</td></tr>
                                 <tr><td id="single-email-subject"><b>Subject: </b>${element.subject}</td></tr>
                                 <tr><td id="single-email-timestamp"><b>Timestamp: </b>${element.timestamp}</td></tr>
                                 <tr><td><button type="button" id="reply-button"  onclick="reply_email()" class="btn btn-sm btn-outline-primary">Reply</button></tr></td>

                                 <tr><td><hr></td></tr>
                                 <tr><td id="single-email-body">${element.body}</td></tr>`;

               fetch(`/emails/${element.id}`, {
                 method: 'PUT',
                 body: JSON.stringify({
                     read: true
                 })
               })
               
               
               // Add new element to our div
               document.querySelector('#single-email-view').append(div);
           });

         });
       
     });
     
   });
   
 

  }
  if(mailbox ==='archive'){
    fetch('/emails/archive')
    .then(response => response.json())
    .then(emails => {
        // Print emails
        console.log(emails);

        // ... do something else with emails ...

        //for each element in my emails array I need to create a new div.
        emails.forEach(element => {
        
        // Find the task the user just submitted
        const email = element.value;

        // Create a list item for the new task and add the task to it
        const table = document.createElement('table');
        table.innerHTML = `<tr>
                            <td>${element.recipients}</td> 
                            <td>${element.subject}</td> 
                            <td>${element.timestamp}</td>
                           </tr>`;

        // Add new element to our unordered list:
        document.querySelector('#emails-view').append(table);

        
          //Adding an event listener so that we can access a specific email once clicked
          let id = element.id;
          table.addEventListener('click', function() {
            console.log('This element has been clicked!')
            // Show the mailbox and hide other views
            document.querySelector('#single-email-view').style.display='block';
            document.querySelector('#compose-view').style.display = 'none';
            document.querySelector('#emails-view').style.display = 'none';
            fetch(`/emails/${id}`)
            .then(response => response.json())
            .then(email => {
                current_email = element;
                // Print email
                console.log(email);
                // Create a list item for the new task and add the task to it
                const div = document.createElement('table');
                div.innerHTML = `<tr><td id="single-email-sender"><b>From:</b> ${element.sender}</td></tr>
                                  <tr><td id="single-email-recipient"><b>To: </b> ${element.recipients}</td></tr>
                                  <tr><td id="single-email-subject"><b>Subject: </b>${element.subject}</td></tr>
                                  <tr><td id="single-email-timestamp"><b>Timestamp: </b>${element.timestamp}</td></tr>
                                  <tr><td><button type="button" id="reply-button"  onclick="reply_email()" class="btn btn-sm btn-outline-primary">Reply</button></tr></td>
                                  <tr><td><button type="button" id="unarchive-button" onclick="unarchive_email()" class="btn btn-sm btn-outline-primary">Unarchive</button></tr></td>
                                  <tr><td><hr></td></tr>
                                  <tr><td id="single-email-body">${element.body}</td></tr>`;

                fetch(`/emails/${element.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      read: true
                  })
                })
                
                
                // Add new element to our div
                document.querySelector('#single-email-view').append(div);
            });

          });
        
      });
      
    });
    

  }




}