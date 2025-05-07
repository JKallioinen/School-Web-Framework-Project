const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const exphbs = require('express-handlebars');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));


// Handlebars
app.engine('handlebars', exphbs.engine({
    extname: 'handlebars', 
    defaultLayout: 'main',
    helpers: {
        importanceLabel: function(color) {
          if (color === 'lightgreen') return 'Low';
          if (color === 'yellow') return 'Medium';
          if (color === 'lightcoral') return 'High';
          return color;
        }
      }}));

app.set('view engine', 'handlebars');
app.set('views', './views');

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// MongoDB connection
const MONGO_URI = 'mongodb+srv://'+ process.env.DBUSERNAME + ':'+ process.env.DBPASSWORD +'@' + process.env.CLUSTER + '.mongodb.net/'+ process.env.DB +'?retryWrites=true&w=majority&appName=Cluster0';
//console.log(MONGO_URI);

mongoose.connect(MONGO_URI)
.then((result) =>
{
    console.log('Connected to DB');
    app.listen(PORT, () => console.log("Listening on " + PORT));
})
.catch((err) => {
    console.log(err);
})


const calendars = require('./models/Calendar');

// GET events from MongoDB for Calendar
app.get('/api/events', async (req, res) => {
    try {
        const events = await calendars.find().lean();
        
        const formattedEvents = events.map(event => {
            const start = new Date(event.start);
            const end = event.end ? new Date(event.end) : null;

            // ✅ Manually add 3 hours for Helsinki time
            start.setHours(start.getHours() + 3);
            if (end) end.setHours(end.getHours() + 3);

            return {
                title: event.title,
                start: start.toISOString(), // formatted ISO string
                end: end ? end.toISOString() : undefined,
                color: event.importance,
                textColor: 'black'
            };
        });

        res.status(200).json(formattedEvents);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET events from MongoDB for list
app.get('/events', async (req,res) => {
    try {
        const events = await calendars.find().lean();

        const sortedEvents = events.sort((a, b) => {
            const dateA = new Date(a.start);
            const dateB = new Date(b.start);
        
            if (dateA.getTime() !== dateB.getTime()) {
                return dateA - dateB; // Sort by earliest date first
            }
        
            // Custom priority order: lightcoral (high), yellow (medium), lightgreen (low)
            const importanceOrder = { lightcoral: 1, yellow: 2, lightgreen: 3 };
            return importanceOrder[a.importance] - importanceOrder[b.importance];
        });

        const formattedEvents = events.map(event => {
            const startDate = new Date(event.start);
            const endDate = event.end ? new Date(event.end) : null;
          
            const startTime = startDate.toLocaleTimeString('fi-FI', {
              hour: '2-digit',
              minute: '2-digit'
            });
          
            const endTime = endDate ? endDate.toLocaleTimeString('fi-FI', {
              hour: '2-digit',
              minute: '2-digit'
            }) : null;
          
            return {
              ...event,
              date: startDate.toLocaleDateString('fi-FI'),
              time: endTime ? `${startTime} – ${endTime}` : startTime,
              importance: event.importance
            };
          });
        res.render('events', 
            {
                title: 'Our Events',
                events: formattedEvents
            }
        )
    }
    catch (error) {
        res.status(404).render('events', {
            title: 'Something is wrong!'
        })
        console.log(error);
    }
});



// CREATE event
app.post('/events', async (req, res) => {

    try {
        const newEvent = new calendars({
            ...req.body,
            start: new Date(req.body.start),
            end: req.body.end ? new Date(req.body.end) : null
        });
    
        await newEvent.save();

        if (newEvent.end) {
            responseMessage = `Event added! ${newEvent.title} on ${newEvent.start} until ${newEvent.end}`;
        } else {
            responseMessage = `Event added! ${newEvent.title} on ${newEvent.start} with no end time`;
        }
        res.send(responseMessage);

    } catch (error) {
        res.status(500).send(`Error adding event: ${error.message}`);
    }
});

//DELETE event
app.delete('/events/:id', async (req, res) => {
    try {
        await calendars.findByIdAndDelete(req.params.id);
        res.redirect('/events');
    } catch (error) {
        res.status(500).send("Error deleting event");
    }
});



// HOME
app.get('/', (req, res) => {
    res.render('index');
    console.log('amen');
});