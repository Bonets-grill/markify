/**
 * Simple in-memory async job queue.
 * MVP implementation using Map — can be swapped for Redis/BullMQ later.
 */

import { v4 as uuidv4 } from 'uuid';

export type JobType = 'watermark' | 'detect' | 'verify';
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  type: JobType;
  payload: Record<string, unknown>;
  status: JobStatus;
  result?: unknown;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type JobHandler = (payload: Record<string, unknown>) => Promise<unknown>;

/**
 * In-memory job queue with auto-processing.
 * Jobs are processed sequentially in FIFO order.
 */
export class JobQueue {
  private jobs = new Map<string, Job>();
  private queue: string[] = [];
  private handlers = new Map<JobType, JobHandler>();
  private processing = false;

  /**
   * Register a handler for a specific job type.
   */
  registerHandler(type: JobType, handler: JobHandler): void {
    this.handlers.set(type, handler);
  }

  /**
   * Enqueue a new job. Returns the job ID.
   * Automatically triggers processing if not already running.
   */
  enqueue(job: Omit<Job, 'id' | 'status' | 'createdAt' | 'updatedAt'>): string {
    const id = `job_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
    const now = new Date();

    const fullJob: Job = {
      id,
      type: job.type,
      payload: job.payload,
      status: 'queued',
      createdAt: now,
      updatedAt: now,
    };

    this.jobs.set(id, fullJob);
    this.queue.push(id);

    // Auto-process (non-blocking)
    void this.autoProcess();

    return id;
  }

  /**
   * Get the current status and details of a job.
   */
  getStatus(jobId: string): Job | null {
    return this.jobs.get(jobId) ?? null;
  }

  /**
   * Get all jobs, optionally filtered by status.
   */
  listJobs(filter?: { status?: JobStatus; type?: JobType }): Job[] {
    const all = Array.from(this.jobs.values());
    if (!filter) return all;

    return all.filter((job) => {
      if (filter.status && job.status !== filter.status) return false;
      if (filter.type && job.type !== filter.type) return false;
      return true;
    });
  }

  /**
   * Process the next job in the queue.
   * Returns immediately if the queue is empty.
   */
  async processNext(): Promise<void> {
    const jobId = this.queue.shift();
    if (!jobId) return;

    const job = this.jobs.get(jobId);
    if (!job) return;

    const handler = this.handlers.get(job.type);
    if (!handler) {
      job.status = 'failed';
      job.error = `No handler registered for job type: ${job.type}`;
      job.updatedAt = new Date();
      return;
    }

    job.status = 'processing';
    job.updatedAt = new Date();

    try {
      const result = await handler(job.payload);
      job.status = 'completed';
      job.result = result;
    } catch (err) {
      job.status = 'failed';
      job.error = err instanceof Error ? err.message : String(err);
    }

    job.updatedAt = new Date();
  }

  /**
   * Process all queued jobs sequentially.
   * Prevents concurrent processing runs.
   */
  private async autoProcess(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      while (this.queue.length > 0) {
        await this.processNext();
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Remove completed or failed jobs older than the given age (milliseconds).
   * Useful for preventing memory leaks in long-running processes.
   */
  cleanup(maxAgeMs: number = 3600_000): number {
    const cutoff = Date.now() - maxAgeMs;
    let removed = 0;

    for (const [id, job] of this.jobs) {
      if (
        (job.status === 'completed' || job.status === 'failed') &&
        job.updatedAt.getTime() < cutoff
      ) {
        this.jobs.delete(id);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Get queue statistics.
   */
  stats(): { total: number; queued: number; processing: number; completed: number; failed: number } {
    let queued = 0;
    let processing = 0;
    let completed = 0;
    let failed = 0;

    for (const job of this.jobs.values()) {
      switch (job.status) {
        case 'queued': queued++; break;
        case 'processing': processing++; break;
        case 'completed': completed++; break;
        case 'failed': failed++; break;
      }
    }

    return { total: this.jobs.size, queued, processing, completed, failed };
  }
}
