import { create } from "zustand"
import {
  getTaskStatuses,
  getTasks,
  getTasksByStatus,
  createTask,
  deleteTask,
  moveTask,
  updateTask,
  createTaskStatus,
  updateTaskStatus,
  deleteTaskStatus,
  getTaskCountByStatus,
  getSubtasks,
  createSubtask,
  toggleSubtask,
  deleteSubtask,
  getAllSubtaskCounts,
  type TaskStatus,
  type Task,
  type Subtask,
  type Priority,
  type ProgressLevel,
} from "../modules/work/taskStore"

interface TaskState {
  statuses: TaskStatus[]
  tasks: Task[]
  subtaskCounts: Map<number, { total: number; completed: number }>

  refresh: (filterProjectId?: number) => void
  addTask: (title: string, statusId: number, projectId: number | null, priority: Priority, description?: string) => void
  removeTask: (id: number) => void
  editTask: (id: number, title: string, description: string, priority: Priority, labels: string, dueDate: string | null) => void
  changeStatus: (taskId: number, statusId: number) => void
  addStatus: (name: string, color: string, progress: ProgressLevel) => void
  editStatus: (id: number, name: string, color: string, progress: ProgressLevel) => void
  removeStatus: (id: number) => void
  getSubtasks: (taskId: number) => Subtask[]
  addSubtask: (taskId: number, title: string) => void
  toggleSubtaskDone: (subtaskId: number) => void
  removeSubtask: (subtaskId: number) => void
  getTasksByStatus: (statusId: number, projectId?: number) => Task[]
  getTaskCountByStatus: (projectId?: number) => Map<number, number>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  statuses: [],
  tasks: [],
  subtaskCounts: new Map(),

  refresh: (filterProjectId) => set({
    statuses: getTaskStatuses(),
    tasks: getTasks(filterProjectId),
    subtaskCounts: getAllSubtaskCounts(),
  }),

  addTask: (title, statusId, projectId, priority, description = "") => {
    createTask(title, statusId, projectId, priority, description)
    get().refresh()
  },

  removeTask: (id) => {
    deleteTask(id)
    get().refresh()
  },

  editTask: (id, title, description, priority, labels, dueDate) => {
    updateTask(id, title, description, priority, labels, dueDate)
    get().refresh()
  },

  changeStatus: (taskId, statusId) => {
    moveTask(taskId, statusId)
    get().refresh()
  },

  addStatus: (name, color, progress) => {
    createTaskStatus(name, color, progress)
    get().refresh()
  },

  editStatus: (id, name, color, progress) => {
    updateTaskStatus(id, name, color, progress)
    get().refresh()
  },

  removeStatus: (id) => {
    deleteTaskStatus(id)
    get().refresh()
  },

  getSubtasks,

  addSubtask: (taskId, title) => {
    createSubtask(taskId, title)
    set({ subtaskCounts: getAllSubtaskCounts() })
  },

  toggleSubtaskDone: (subtaskId) => {
    toggleSubtask(subtaskId)
    set({ subtaskCounts: getAllSubtaskCounts() })
  },

  removeSubtask: (subtaskId) => {
    deleteSubtask(subtaskId)
    set({ subtaskCounts: getAllSubtaskCounts() })
  },

  getTasksByStatus: (statusId, projectId) => getTasksByStatus(statusId, projectId),
  getTaskCountByStatus: (projectId) => getTaskCountByStatus(projectId),
}))
