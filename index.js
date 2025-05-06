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
            const dateObj = new Date(event.start);
            return {
              ...event,
              date: dateObj.toLocaleDateString('fi-FI'),
              time: dateObj.toLocaleTimeString('fi-FI', {
                hour: '2-digit',
                minute: '2-digit',
              }),
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
        
            // Custom priority order: red (high), yellow (medium), green (low)
            const importanceOrder = { lightcoral: 1, yellow: 2, lightgreen: 3 };
            return importanceOrder[a.importance] - importanceOrder[b.importance];
        });

        const formattedEvents = events.map(event => {
            const dateObj = new Date(event.start);
            return {
              ...event,
              date: dateObj.toLocaleDateString('fi-FI'),
              time: dateObj.toLocaleTimeString('fi-FI', {
                hour: '2-digit',
                minute: '2-digit',
              }),
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
    const newEvent = new calendars(req.body);
    

    const eventDate = newEvent.start.toLocaleDateString('fi-FI'); // or 'fi-FI' for Finnish
    const eventTime = newEvent.start.toLocaleTimeString('fi-FI', {
        hour: '2-digit',
        minute: '2-digit'
    });


    await newEvent.save();
    res.send(`Event added! ${newEvent.title} on ${eventDate} at ${eventTime}`);
    
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