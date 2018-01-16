import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as moment from 'moment';

enum State
{
    MONTH_SELECTION = 1,
    DATE_SELECTION = 2
}

interface Month
{
    value: number,
    name: string
}

interface Week
{
    value: number,
    dates: moment.Moment[]
}

@Component({
    selector: 'date-picker',
    templateUrl: './date-picker.component.html',
    styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {
    private _date: Date = null;
    @Output() dateChange: EventEmitter<Date> = new EventEmitter<Date>();

    selectedDate: moment.Moment = null;
    navigationDate: moment.Moment = moment();

    private state: State = State.MONTH_SELECTION;

    // month selection
    monthsRow: moment.Moment[][] = [];

    // date selection
    weekDays: string[] = [];
    weeks: Week[] = [];

    get date(): Date {
        return this._date;
    }

    @Input()
    set date(date: Date) {
        this._date = date;

        if (date) {
            this.selectedDate = moment(date);
            this.navigationDate = moment(date);
        }
    }

    get isMonthSelectionVisible(): boolean {
        return this.state === State.MONTH_SELECTION;
    }

    get isDateSelectionVisible(): boolean {
        return this.state === State.DATE_SELECTION;
    }

    get navigationTitle(): string {
        if (this.isMonthSelectionVisible) {
            return this.navigationDate.format('YYYY');
        }
        return this.navigationDate.format('MMMM, YYYY');
    }

    ngOnInit(): void {
        this.createMonths();
        this.createWeekDays();
    }

    private createMonths(): void {
        const createMonth = (value: number): moment.Moment => {
            return moment().year(this.navigationDate.year()).month(value);
        };
        this.monthsRow = [
            [createMonth(0), createMonth(1), createMonth(2), createMonth(3)],
            [createMonth(4), createMonth(5), createMonth(6), createMonth(7)],
            [createMonth(8), createMonth(9), createMonth(10), createMonth(11)],
        ];
    }

    private createWeekDays(): void {
        const weekDays = [];
        for (let day = 0; day < 7; day++) {
            weekDays.push(moment().weekday(day).format('dd'));
        }
        this.weekDays = weekDays;
    }

    private createDates(): void {
        const startOfDates = moment(this.navigationDate).startOf('month').startOf('week');
        const endOfDates = moment(this.navigationDate).endOf('month').endOf('week');

        let date = moment(startOfDates);

        const weeks = [];
        let currentWeek = null;
        while(date.unix() <= endOfDates.unix()) {
            if (currentWeek === null) {
                currentWeek = {value: date.week(), dates: []};
            }
            currentWeek.dates.push(moment().year(date.year()).month(date.month()).date(date.date()));
            date.add(1, 'day');
            if (date.week() !== currentWeek.value) {
                weeks.push(currentWeek);
                currentWeek = null;
            }
        }
        this.weeks = weeks;
    }

    navigationTitleClicked(): void {
        if (this.isDateSelectionVisible) {
            this.state = State.MONTH_SELECTION;
        }
    }

    navigateBackward(): void {
        if (this.isMonthSelectionVisible) {
            this.navigationDate.year(this.navigationDate.year() - 1);
            this.createMonths();
        } else {
            this.navigationDate.month(this.navigationDate.month() - 1);
            this.createDates();
        }
    }

    navigateForward(): void {
        if (this.isMonthSelectionVisible) {
            this.navigationDate.year(this.navigationDate.year() + 1);
            this.createMonths();
        } else {
            this.navigationDate.month(this.navigationDate.month() + 1);
            this.createDates();
        }
    }

    // month selection
    onMonthClicked(month: moment.Moment): void {
        this.navigationDate.month(month.month());
        this.state = State.DATE_SELECTION;
        this.createDates();
    }

    isMonthSelected(month: moment.Moment): boolean {
        if (!this.selectedDate) {
            return false;
        }
        return this.selectedDate.isSame(month, 'month');
    }

    // date selection
    onDateClicked(date: moment.Moment): void {
        if (!this.selectedDate) {
            this.selectedDate = moment();
        }
        this.selectedDate.year(date.year());
        this.selectedDate.month(date.month());
        this.selectedDate.date(date.date());
    }

    isDateSelected(date: moment.Moment): boolean {
        if (!this.selectedDate) {
            return false;
        }
        return this.selectedDate.isSame(date, 'date');
    }

    // methods to call from 'outside'
    save(): void {
        if (this.selectedDate) {
            if (!this.date) {
                this._date = new Date();
            }

            this.date.setYear(this.selectedDate.year());
            this.date.setMonth(this.selectedDate.month());
            this.date.setDate(this.selectedDate.date());
        }

        this.dateChange.emit(this.date);
    }

    reset(): void {
        this.state = State.MONTH_SELECTION;

        if (this.date) {
            this.selectedDate = moment(this.date);
            this.navigationDate = moment(this.date);
        } else {
            this.selectedDate = null;
            this.navigationDate = moment();
        }
    }
}
