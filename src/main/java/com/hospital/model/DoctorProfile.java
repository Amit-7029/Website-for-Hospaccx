package com.hospital.model;

public class DoctorProfile {

    private final String name;
    private final String department;
    private final String qualification;
    private final String charges;
    private final String timing;
    private final String opdDays;

    public DoctorProfile(String name,
                         String department,
                         String qualification,
                         String charges,
                         String timing,
                         String opdDays) {
        this.name = name;
        this.department = department;
        this.qualification = qualification;
        this.charges = charges;
        this.timing = timing;
        this.opdDays = opdDays;
    }

    public String getName() {
        return name;
    }

    public String getDepartment() {
        return department;
    }

    public String getQualification() {
        return qualification;
    }

    public String getCharges() {
        return charges;
    }

    public String getTiming() {
        return timing;
    }

    public String getOpdDays() {
        return opdDays;
    }
}
