import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { format } from "date-fns";
import { createEvent } from "../../services/events";
import Button from "../UI/Button";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  time: z.string().min(1, "Time is required"),
});

export default function EventForm({ selectedDate, onClose }) {
  const form = useForm({
    validator: zodValidator,
    defaultValues: {
      title: "",
      description: "",
      time: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await createEvent({
          ...value,
          date: selectedDate.toISOString(),
        });
        onClose();
      } catch (error) {
        console.error("Error creating event:", error);
      }
    },
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-slate-200">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Create New Event
          </h3>
          <p className="text-slate-500">
            for {format(selectedDate, "MMMM d, yyyy")}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <form.Field
            name="title"
            children={(field) => (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Event Title
                </label>
                <input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                  placeholder="Enter event title"
                />
                {field.state.meta.errors && (
                  <div className="text-red-500 text-sm mt-2 flex items-center gap-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {field.state.meta.errors.join(", ")}
                  </div>
                )}
              </div>
            )}
          />

          <form.Field
            name="time"
            children={(field) => (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                />
                {field.state.meta.errors && (
                  <div className="text-red-500 text-sm mt-2 flex items-center gap-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {field.state.meta.errors.join(", ")}
                  </div>
                )}
              </div>
            )}
          />

          <form.Field
            name="description"
            children={(field) => (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white resize-none"
                  rows={3}
                  placeholder="Add event description..."
                />
              </div>
            )}
          />

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}