import React, { Component } from "react";
import BigCalendar from "react-big-calendar";
import moment from "moment";
import Popup from "react-popup";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./../styles/App.css";

const localizer = BigCalendar.momentLocalizer(moment);

class EventForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: props.title || "",
      location: props.location || "",
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.onSave({
      title: this.state.title.trim() || "Untitled Event",
      location: this.state.location.trim(),
    });
    Popup.close();
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit} className="event-form">
        <div className="form-group">
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={this.state.title}
            onChange={this.handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="location"
            placeholder="Event Location"
            value={this.state.location}
            onChange={this.handleChange}
          />
        </div>
        <div className="mm-popup__box__footer">
          <div className="mm-popup__box__footer__right-space">
            <button type="submit" className="mm-popup__btn">
              Save
            </button>
          </div>
        </div>
      </form>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      filter: "ALL", // "ALL" | "PAST" | "UPCOMING"
      selectedSlot: null,
    };
  }

  isPastEvent = (event) => {
    const endTime = event.end ? new Date(event.end) : new Date(event.start);
    return endTime < new Date();
  };

  openCreatePopup = (slotInfo) => {
    const start = slotInfo ? slotInfo.start : this.state.selectedSlot || new Date();
    const end = slotInfo ? slotInfo.end : start;

    Popup.create({
      title: "Create Event",
      content: (
        <EventForm
          onSave={({ title, location }) => {
            const newEvent = {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              title,
              location,
              start,
              end,
            };
            this.setState((prevState) => ({
              events: [...prevState.events, newEvent],
            }));
          }}
        />
      ),
      buttons: {
        right: [],
      },
    });
  };

  openEditFormPopup = (event) => {
    Popup.create({
      title: "Edit Event",
      content: (
        <EventForm
          title={event.title}
          location={event.location}
          onSave={({ title, location }) => {
            this.setState((prevState) => ({
              events: prevState.events.map((item) =>
                item.id === event.id ? { ...item, title, location } : item
              ),
            }));
          }}
        />
      ),
      buttons: {
        right: [],
      },
    });
  };

  openEventActionPopup = (event) => {
    Popup.create({
      title: event.title,
      content: (
        <div>
          <p>
            <strong>Location:</strong> {event.location || "Not specified"}
          </p>
          <p>
            <strong>Date:</strong> {moment(event.start).format("LLL")}
          </p>
        </div>
      ),
      buttons: {
        left: [
          {
            text: "Delete",
            className: "danger",
            action: (popup) => {
              this.setState((prevState) => ({
                events: prevState.events.filter((item) => item.id !== event.id),
              }));
              popup.close();
            },
          },
        ],
        right: [
          {
            text: "Edit",
            className: "info",
            action: (popup) => {
              popup.close();
              this.openEditFormPopup(event);
            },
          },
        ],
      },
    });
  };

  getFilteredEvents = () => {
    const { events, filter } = this.state;
    if (filter === "PAST") {
      return events.filter((ev) => this.isPastEvent(ev));
    }
    if (filter === "UPCOMING") {
      return events.filter((ev) => !this.isPastEvent(ev));
    }
    return events;
  };

  eventStyleGetter = (event) => {
    const past = this.isPastEvent(event);
    const backgroundColor = past ? "rgb(222, 105, 135)" : "rgb(140, 189, 76)";
    return {
      style: {
        backgroundColor,
        borderColor: backgroundColor,
        color: "#ffffff",
      },
    };
  };

  render() {
    const { filter } = this.state;
    const filteredEvents = this.getFilteredEvents();

    return (
      <div>
        {/* Do not remove the main div */}
        <div className="tracker-header">
          <button
            type="button"
            className="btn"
            onClick={() => this.openCreatePopup(null)}
          >
            Add Event
          </button>

          <div className="filter-controls">
            <button
              type="button"
              className={`btn ${filter === "ALL" ? "active" : ""}`}
              onClick={() => this.setState({ filter: "ALL" })}
            >
              All
            </button>
            <button
              type="button"
              className={`btn ${filter === "PAST" ? "active" : ""}`}
              onClick={() => this.setState({ filter: "PAST" })}
            >
              Past
            </button>
            <button
              type="button"
              className={`btn ${filter === "UPCOMING" ? "active" : ""}`}
              onClick={() => this.setState({ filter: "UPCOMING" })}
            >
              Upcoming
            </button>
          </div>
        </div>

        <Popup />

        <div className="calendar-wrapper">
          <BigCalendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            selectable
            style={{ height: 550 }}
            eventPropGetter={this.eventStyleGetter}
            onSelectSlot={(slotInfo) => {
              this.setState({ selectedSlot: slotInfo.start });
              this.openCreatePopup(slotInfo);
            }}
            onSelectEvent={(event) => this.openEventActionPopup(event)}
          />
        </div>
      </div>
    );
  }
}

export default App;
