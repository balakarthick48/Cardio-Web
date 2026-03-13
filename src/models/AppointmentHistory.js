export class AppointmentHistory {
  constructor({
    patient_id,
    patient_name,
    appointment_date,
    appointment_type,
    slot_time,
    check_in,
    check_out,
    problem,
    phone_number,
    appointment_id
  }) {
    this.patient_id = patient_id;
    this.patient_name = patient_name;
    this.appointment_date = appointment_date;
    this.appointment_type = appointment_type;
    this.slot_time = slot_time;
    this.check_in = check_in;
    this.check_out = check_out;
    this.problem = problem;
    this.phone_number = phone_number;
    this.appointment_id = appointment_id;
  }

  static fromApi(json) {
    return new AppointmentHistory(json);
  }
}

