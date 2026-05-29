import { create } from "zustand"
import {
  getProjects,
  getClients,
  getTimeEntries,
  createProject,
  createClient,
  createManualEntry,
  deleteProject,
  deleteClient,
  deleteTimeEntry,
  getProjectTotalMinutes,
  getProjectBillable,
  getTodayTotalMinutes,
  getWeekTotalMinutes,
  getDailyWorkMinutes,
  getClientById,
  getProjectsByClient,
  type Project,
  type Client,
  type TimeEntry,
} from "../modules/work/workStore"

interface WorkState {
  projects: Project[]
  clients: Client[]
  timeEntries: TimeEntry[]

  refresh: () => void
  addProject: (name: string, clientId: number | null, description: string, deadline: string | null, hourlyRate: number | null) => void
  removeProject: (id: number) => void
  addClient: (name: string, email: string, phone: string, company: string, notes: string, hourlyRate: number) => void
  removeClient: (id: number) => void
  addManualEntry: (projectId: number | null, description: string, startTime: string, endTime: string) => void
  removeTimeEntry: (id: number) => void

  getProjectTotalMinutes: (projectId: number) => number
  getProjectBillable: (projectId: number) => number
  getTodayTotalMinutes: () => number
  getWeekTotalMinutes: () => number
  getDailyWorkMinutes: (days?: number) => { date: string; minutes: number }[]
  getClientById: (id: number) => Client | null
  getProjectsByClient: (clientId: number) => Project[]
}

export const useWorkStore = create<WorkState>((set, get) => ({
  projects: getProjects(),
  clients: getClients(false),
  timeEntries: getTimeEntries(undefined, 30),

  refresh: () => set({
    projects: getProjects(),
    clients: getClients(false),
    timeEntries: getTimeEntries(undefined, 30),
  }),

  addProject: (name, clientId, description, deadline, hourlyRate) => {
    createProject(name, clientId, description, deadline, hourlyRate)
    get().refresh()
  },

  removeProject: (id) => {
    deleteProject(id)
    get().refresh()
  },

  addClient: (name, email, phone, company, notes, hourlyRate) => {
    createClient(name, email, phone, company, notes, hourlyRate)
    get().refresh()
  },

  removeClient: (id) => {
    deleteClient(id)
    get().refresh()
  },

  addManualEntry: (projectId, description, startTime, endTime) => {
    createManualEntry(projectId, description, startTime, endTime)
    get().refresh()
  },

  removeTimeEntry: (id) => {
    deleteTimeEntry(id)
    get().refresh()
  },

  getProjectTotalMinutes,
  getProjectBillable,
  getTodayTotalMinutes,
  getWeekTotalMinutes,
  getDailyWorkMinutes,
  getClientById,
  getProjectsByClient,
}))
