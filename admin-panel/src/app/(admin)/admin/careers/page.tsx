"use client";

import { useMemo } from "react";
import { BriefcaseBusiness, Download, FileUser, Pencil, Search, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { JobForm } from "@/features/careers/components/job-form";
import { useCareersManager } from "@/features/careers/hooks/use-careers-manager";
import { cn, formatDateTime } from "@/lib/utils";

export default function CareersPage() {
  const {
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
  } = useCareersManager();

  const canManageJobs = canAddCareers || canEditCareers;
  const pageDescription = useMemo(() => {
    if (canViewCareers && canViewApplications) {
      return "Manage live job openings and review incoming applications from one place.";
    }

    if (canViewCareers) {
      return "Manage active and archived hospital career openings.";
    }

    return "Review career applications, resumes, and shortlist status updates.";
  }, [canViewApplications, canViewCareers]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Careers"
        description={pageDescription}
        action={
          canAddCareers
            ? {
                label: "Add job",
                onClick: () => setEditingJob(null),
              }
            : undefined
        }
      />

      {canViewCareers ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="grid gap-4 md:grid-cols-[1fr,220px,180px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={jobSearch} onChange={(event) => setJobSearch(event.target.value)} className="pl-10" placeholder="Search jobs..." />
                </div>
                <Select value={jobDepartmentFilter} onChange={(event) => setJobDepartmentFilter(event.target.value)}>
                  <option value="all">All departments</option>
                  {departmentOptions.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </Select>
                <Select value={jobStatusFilter} onChange={(event) => setJobStatusFilter(event.target.value as typeof jobStatusFilter)}>
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>

              {isLoadingJobs ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-56 rounded-3xl" />
                  ))}
                </div>
              ) : filteredJobs.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredJobs.map((job) => (
                    <Card key={job.id} className="border bg-background/50 shadow-none">
                      <CardContent className="space-y-4 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {job.department} | {job.location}
                            </p>
                          </div>
                          <Badge variant={job.status === "active" ? "success" : "warning"}>{job.status}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{job.jobType}</Badge>
                          <Badge variant="secondary">{job.experience}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{job.shortDescription}</p>
                        <div className="flex gap-3">
                          {canEditCareers ? (
                            <Button variant="outline" className="flex-1" onClick={() => setEditingJob(job)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          ) : null}
                          {canDeleteCareers ? (
                            <Button variant="destructive" size="icon" onClick={() => setJobToDelete(job)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState icon={BriefcaseBusiness} title="No career openings found" description="Add your first role to publish openings on the website career page." />
              )}
            </CardContent>
          </Card>

          {canManageJobs ? (
            <JobForm
              job={editingJob}
              isSaving={isSavingJob}
              onCancel={() => setEditingJob(null)}
              onSave={saveJob}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                This role can review job openings, but creating or editing jobs requires{" "}
                <span className="font-medium text-foreground">careers_add</span> or{" "}
                <span className="font-medium text-foreground">careers_edit</span>.
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}

      {canViewApplications ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold">Applications</h2>
              <p className="text-sm text-muted-foreground">Review applicants, download resumes, and update their hiring status.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr,220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={applicationSearch}
                  onChange={(event) => setApplicationSearch(event.target.value)}
                  className="pl-10"
                  placeholder="Search applicants..."
                />
              </div>
              <Select value={applicationStatusFilter} onChange={(event) => setApplicationStatusFilter(event.target.value as typeof applicationStatusFilter)}>
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>

            {isLoadingApplications ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-40 rounded-3xl" />)
            ) : filteredApplications.length ? (
              filteredApplications.map((application) => (
                <Card key={application.id} className="border bg-background/50 shadow-none">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold">{application.name}</h3>
                          <Badge
                            variant={
                              application.status === "selected"
                                ? "success"
                                : application.status === "rejected"
                                  ? "destructive"
                                  : "warning"
                            }
                          >
                            {application.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{application.jobTitle}</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {application.email} | {application.phone}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(application.createdAt ?? "")}</p>
                      </div>
                      <a
                        href={application.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(buttonVariants({ variant: "outline" }), "w-full md:w-auto")}
                      >
                        <Download className="h-4 w-4" />
                        Download resume
                      </a>
                    </div>

                    {application.message ? <p className="text-sm text-muted-foreground">{application.message}</p> : null}

                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        onClick={() => void updateApplicationStatus(application, "pending")}
                        disabled={!canUpdateApplications || isUpdatingApplication}
                      >
                        Pending
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => void updateApplicationStatus(application, "selected")}
                        disabled={!canUpdateApplications || isUpdatingApplication}
                      >
                        Selected
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => void updateApplicationStatus(application, "rejected")}
                        disabled={!canUpdateApplications || isUpdatingApplication}
                      >
                        Rejected
                      </Button>
                      {canDeleteApplications ? (
                        <Button variant="destructive" onClick={() => void removeApplication(application)} disabled={isUpdatingApplication}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyState icon={FileUser} title="No applications yet" description="Applications submitted from the career page will appear here with resume download links." />
            )}
          </CardContent>
        </Card>
      ) : null}

      {!canViewCareers && !canViewApplications ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            This role does not currently have careers access. Add{" "}
            <span className="font-medium text-foreground">careers_view</span> or{" "}
            <span className="font-medium text-foreground">applications_view</span> to open this module.
          </CardContent>
        </Card>
      ) : null}

      {canDeleteCareers ? (
        <ConfirmDialog
          open={Boolean(jobToDelete)}
          title="Delete job opening?"
          description="This removes the role from the published career page and keeps existing applications untouched."
          destructive
          confirmLabel="Delete job"
          onClose={() => setJobToDelete(null)}
          onConfirm={() => void removeJob()}
        />
      ) : null}
    </div>
  );
}
