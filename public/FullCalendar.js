
$(document).ready(function() {
    $('#calendar').fullCalendar({
        selectable: true,
        selectHelper: true,
        select: function()
        {
            $('#myModal').modal('toggle');
        },
        header: 
        {
            left: 'month, agendaWeek, agendaDay, list',
            center: 'title',
            right: 'prev, today, next'
        },
        buttonText: 
        {
            month: 'Month',
            week: 'Week',
            day: 'Day',
            list: 'List',
            today: 'Today'
        },
        firstDay: 1,
        events: '/api/events',
        timeFormat: 'HH:mm',
        
    });
});