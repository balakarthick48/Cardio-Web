class DateValues {
  static #instance;

  constructor() {
    const now = new Date();

    this.currentYear = now.getFullYear();
    this.currentMonth = String(now.getMonth() + 1).padStart(2, '0');

    // 3 years before up to current year (no future years)
    this.years = Array.from({ length: 4 }, (_, index) => this.currentYear - 3 + index);

    this.months = [
      { value: '01', label: 'January' },
      { value: '02', label: 'February' },
      { value: '03', label: 'March' },
      { value: '04', label: 'April' },
      { value: '05', label: 'May' },
      { value: '06', label: 'June' },
      { value: '07', label: 'July' },
      { value: '08', label: 'August' },
      { value: '09', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' },
    ];
  }

  static getInstance() {
    if (!DateValues.#instance) {
      DateValues.#instance = new DateValues();
    }
    return DateValues.#instance;
  }
}

export default DateValues.getInstance();

