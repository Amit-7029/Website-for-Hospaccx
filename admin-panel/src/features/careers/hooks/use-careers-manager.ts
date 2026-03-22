"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/components/providers/app-providers";
import { usePermissions } from "@/hooks/use-permissions";
import { addActivityLog, deleteDocument, listCollection, saveDocument } from "@/lib/firebase/repository";
import type { CareerApplication, CareerJob } from "@/types";

type ApplicationStatusFilter = "all" | CareerApplication["status"];
type JobStatusFilter = "all" | CareerJob["status"];

export function useCareersManager() {
  const { sessionUser } = useSession();
  const {
    role,
    canAddCareers,
    canDeleteCareers,
    canEditCareers,
    canViewCareers,
    canDeleteApplications,
    canUpdateApplications,
    canViewApplications,
  } = usePermissions();
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [editingJob, setEditingJob] = useState<CareerJob | null>(null);
  const [jobToDelete, setJobToDelete] = useState<CareerJob | null>(null);
  const [jobSearch, setJobSearch] = useState("");
  const [jobDepartmentFilter, setJobDepartmentFilter] = useState("all");
  const [jobStatusFilter, setJobStatusFilter] = useState<JobStatusFilter>("all");
  const [applicationSearch, setApplicationSearch] = useState("");
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<ApplicationStatusFilter>("all");
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [isSavingJob, setIsSavingJob] = useState(false);
  const [isUpdatingApplication, setIsUpdatingApplication] = useState(false);

  const loadJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const items = await listCollection<CareerJob>("jobs");
      setJobs(items);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load jobs");
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const loadApplications = async () => {
    setIsLoadingApplications(true);
    try {
      const items = await listCollection<CareerApplication>("applications");
      setApplications(items);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load applications");
    } finally {
      setIsLoadingApplications(false);
    }
  };

  useEffect(() => {
    void loadJobs();
    void loadApplications();
  }, []);

  const departmentOptions = useMemo(
    () => [...new Set(jobs.map((job) => job.department).filter(Boolean))].sort((left, right) => left.localeCompare(right)),
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    const normalizedSearch = jobSearch.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !normalizedSearch ||
        [job.title, job.department, job.location, job.shortDescription]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesDepartment = jobDepartmentFilter === "all" || job.department === jobDepartmentFilter;
      const matchesStatus = jobStatusFilter === "all" || job.status === jobStatusFilter;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [jobDepartmentFilter, jobSearch, jobStatusFilter, jobs]);

  const filteredApplications = useMemo(() => {
    const normalizedSearch = applicationSearch.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        !normalizedSearch ||
        [application.name, application.email, application.phone, application.jobTitle]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus = applicationStatusFilter === "all" || application.status === applicationStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applicationSearch, applicationStatusFilter, applications]);

  const saveJob = async (
    values: Omit<CareerJob, "id" | "createdAt" | "updatedAt" | "requirements"> & { id?: string; requirements: string },
  ) => {
    const canSave = editingJob ? canEditCareers : canAddCareers;
    if (!canSave) {
      toast.error(editingJob ? "You do not have permission to edit jobs" : "You do not have permission to add jobs");
      return false;
    }

    setIsSavingJob(true);
    try {
      const payload: Omit<CareerJob, "id" | "updatedAt"> & { id?: string } = {
        ...(editingJob?.id ? { id: editingJob.id } : {}),
        title: values.title,
        department: values.department,
        location: values.location,
        experience: values.experience,
        jobType: values.jobType,
        shortDescription: values.shortDescription,
        description: values.description,
        requirements: values.requirements
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        status: values.status,
        createdAt: editingJob?.createdAt,
      };

      const saved = await saveDocument("jobs", payload);
      await addActivityLog({
        action: editingJob ? "Updated career job" : "Added career job",
        entity: "career",
        entityId: saved.id,
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });
      toast.success(editingJob ? "Job updated" : "Job added");
      setEditingJob(null);
      await loadJobs();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save job");
      return false;
    } finally {
      setIsSavingJob(false);
    }
  };

  const removeJob = async () => {
    if (!canDeleteCareers) {
      toast.error("You do not have permission to delete jobs");
      return;
    }

    if (!jobToDelete) {
      return;
    }

    try {
      await deleteDocument("jobs", jobToDelete.id);
      await addActivityLog({
        action: "Deleted career job",
        entity: "career",
        entityId: jobToDelete.id,
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });
      toast.success("Job deleted");
      setJobToDelete(null);
      await loadJobs();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete job");
    }
  };

  const updateApplicationStatus = async (application: CareerApplication, status: CareerApplication["status"]) => {
    if (!canUpdateApplications) {
      toast.error("You do not have permission to update applications");
      return;
    }

    setIsUpdatingApplication(true);
    try {
      await saveDocument("applications", {
        ...application,
        status,
      });
      await addActivityLog({
        action: `Marked application as ${status}`,
        entity: "application",
        entityId: application.id,
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });
      toast.success(`Application marked ${status}`);
      await loadApplications();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update application");
    } finally {
      setIsUpdatingApplication(false);
    }
  };

  const removeApplication = async (application: CareerApplication) => {
    if (!canDeleteApplications) {
      toast.error("You do not have permission to delete applications");
      return;
    }

    setIsUpdatingApplication(true);
    try {
      await deleteDocument("applications", application.id);
      await addActivityLog({
        action: "Deleted career application",
        entity: "application",
        entityId: application.id,
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });
      toast.success("Application deleted");
      await loadApplications();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete application");
    } finally {
      setIsUpdatingApplication(false);
    }
  };

  return {
    jobs,
    applications,
    filteredJobs,
    filteredApplications,
    editingJob,
    setEditingJob,
    jobToDelete,
    setJobToDelete,
    jobSearch,
    setJobSearch,
    jobDepartmentFilter,
    setJobDepartmentFilter,
    jobStatusFilter,
    setJobStatusFilter,
    applicationSearch,
    setApplicationSearch,
    applicationStatusFilter,
    setApplicationStatusFilter,
    departmentOptions,
    isLoadingJobs,
    isLoadingApplications,
    isSavingJob,
    isUpdatingApplication,
    saveJob,
    removeJob,
    updateApplicationStatus,
    removeApplication,
    canViewCareers,
    canAddCareers,
    canEditCareers,
    canDeleteCareers,
    canViewApplications,
    canUpdateApplications,
    canDeleteApplications,
  };
}
