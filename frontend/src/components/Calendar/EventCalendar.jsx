import { useState } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getEvents } from "../../services/events";
import EventForm from "./EventForm";
import "react-calendar/dist/Calendar.css";

export default function EventCalendar() {
  const [date, setDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const { data: events, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dayEvents = events?.filter(
        (event) => new Date(event.date).toDateString() === date.toDateString()
      );
      return dayEvents?.length > 0 ? (
        <div className="absolute top-1 right-1 h-3 w-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
      ) : null;
    }
  };

  const handleDateClick = (value) => {
    setSelectedDate(value);
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600/30"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          Error fetching events: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
        <Calendar
          onChange={setDate}
          value={date}
          tileContent={tileContent}
          onClickDay={handleDateClick}
          className="w-full border-0 rounded-2xl shadow-lg"
        />
      </div>

      {showForm && (
        <EventForm
          selectedDate={selectedDate}
          onClose={() => setShowForm(false)}
        />
      )}

      <div className="space-y-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Upcoming Events
        </h3>
        {events?.length > 0 ? (
          <div className="grid gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-300 hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {format(new Date(event.date), "MMMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        {event.time}
                      </span>
                    </div>
                    <p className="text-slate-600">{event.description}</p>
                  </div>
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:scale-110 transition-transform"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-slate-400 rounded-full"></div>
            </div>
            <p className="text-slate-500 text-lg">No events scheduled yet</p>
          </div>
        )}
      </div>
    </div>
  );
}