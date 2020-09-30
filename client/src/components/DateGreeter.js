import React from 'react';
import './css/date-greeter.css';

export default class DateGreeter extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            days: [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            ],
            months: [
                "January",
                "Febuary",
                "March",
                "April",
                "May",
                "June",
                "July", 
                "August",
                "September",
                "October",
                "November", 
                "December"
            ]
        }
    }

    _getGreeting = date => {
        let hour = date.getHours();

        if (hour > 18){
            return "Evening";
        }

        if (hour > 12){
            return "Afternoon";
        }

        return "Morning";
    }

    _getDayOfMonth = day => {
        let end = "th";
        switch (day){
            case 1:
            case 21:
            case 31:
                end = "st";
                break;
            case 2:
            case 22:
                end = "nd";
                break;
            case 3:
            case 23:
                end = "rd";
                break;
            default: //Needed to remmove React warning
                end = "th";
        }
        return day + end;
    }

    render(){
        let date = new Date();
        let dayOfWeek = this.state.days[date.getDay()];
        let month = this.state.months[date.getMonth()];
        let dayOfMonth = this._getDayOfMonth(date.getDate());
        let year = date.getFullYear();
        return (
            <div id="date-greeter">
                <p>
                    {`Good ${this._getGreeting(date)}! It is ${dayOfWeek}, the ${dayOfMonth} of ${month}, ${year}.`}
                </p>
            </div>
        );
    }
}