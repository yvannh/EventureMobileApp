import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import EventCard from './EventCard';

const EventListAll = () => {
  const [events, setEvents] = useState([]);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events/all', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user ? user.token : ''}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          const currentDate = new Date();
          console.log(currentDate);
          const futureEvents = data.filter(event => new Date(event.date) > currentDate);
          setEvents(futureEvents);
        } else {
          console.error('Failed to fetch events:', data.error);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [user]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {events.length === 0 ? (
        <p className="col-span-full text-center text-gray-500">No events found.</p>
      ) : (
        events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))
      )}
    </div>
  );
};

export default EventListAll;
