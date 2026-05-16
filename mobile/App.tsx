import { StatusBar } from 'expo-status-bar'
import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

type Role = 'worker' | 'homeowner'

type WorkerTabKey = 'jobs' | 'bookings' | 'chat' | 'earnings'
type HomeownerTabKey = 'my-jobs' | 'post-job' | 'workers' | 'bookings' | 'chat'

interface MatchedJob {
  id: string
  title?: string
  location?: string
  budget?: number
  matchScore?: number
  employerId?: string
  employerName?: string
}

interface PostedJob {
  id: string
  title?: string
  description?: string
  location?: string
  budget?: number
  status?: string
  applicantsCount?: number
}

interface WorkerSummary {
  uid: string
  displayName?: string
  location?: string
  rating?: number
  skills?: string[]
}

interface Booking {
  id: string
  homeownerName?: string
  workerName?: string
  requestedDate?: string
  requestedTime?: string
  status?: string
  address?: string
  description?: string
}

interface ChatSummary {
  id: string
  title?: string
  lastMessage?: string
}

interface EarningsRecord {
  id?: string
  jobTitle?: string
  grossAmount: number
  netAmount: number
}

interface EarningsResponse {
  records?: EarningsRecord[]
  totals?: {
    gross?: number
    net?: number
    fees?: number
    count?: number
  }
}

const WORKER_TABS: Array<{ key: WorkerTabKey; label: string }> = [
  { key: 'jobs', label: 'Jobs' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'chat', label: 'Chat' },
  { key: 'earnings', label: 'Earnings' },
]

const HOMEOWNER_TABS: Array<{ key: HomeownerTabKey; label: string }> = [
  { key: 'my-jobs', label: 'My Jobs' },
  { key: 'post-job', label: 'Post Job' },
  { key: 'workers', label: 'Workers' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'chat', label: 'Chat' },
]

const DEFAULT_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'https://quicktrade.co.nz'

function formatNZD(value: number | undefined): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value ?? 0)
}

export default function App() {
  const [role, setRole] = useState<Role>('worker')
  const [workerTab, setWorkerTab] = useState<WorkerTabKey>('jobs')
  const [homeownerTab, setHomeownerTab] = useState<HomeownerTabKey>('my-jobs')
  const [loading, setLoading] = useState(false)

  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_BASE_URL)
  const [userId, setUserId] = useState('')
  const [displayName, setDisplayName] = useState('')

  // Worker data
  const [jobs, setJobs] = useState<MatchedJob[]>([])
  const [workerBookings, setWorkerBookings] = useState<Booking[]>([])
  const [workerChats, setWorkerChats] = useState<ChatSummary[]>([])
  const [earnings, setEarnings] = useState<EarningsResponse | null>(null)
  const [applicationCoverLetter, setApplicationCoverLetter] = useState('')
  const [applicationRate, setApplicationRate] = useState('')
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null)

  // Homeowner data
  const [myJobs, setMyJobs] = useState<PostedJob[]>([])
  const [workers, setWorkers] = useState<WorkerSummary[]>([])
  const [homeownerBookings, setHomeownerBookings] = useState<Booking[]>([])
  const [homeownerChats, setHomeownerChats] = useState<ChatSummary[]>([])

  // Post-job form
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newJobDescription, setNewJobDescription] = useState('')
  const [newJobCategory, setNewJobCategory] = useState('plumbing')
  const [newJobLocation, setNewJobLocation] = useState('')
  const [newJobBudget, setNewJobBudget] = useState('')
  const [posting, setPosting] = useState(false)

  const baseUrl = useMemo(() => apiBaseUrl.trim().replace(/\/$/, ''), [apiBaseUrl])
  const trimmedUserId = userId.trim()
  const isConfigured = baseUrl.length > 0 && trimmedUserId.length > 0

  const makeUrl = useCallback(
    (path: string, query?: Record<string, string>) => {
      const url = new URL(`${baseUrl}${path}`)
      if (query) {
        Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v))
      }
      return url.toString()
    },
    [baseUrl],
  )

  // ===== Worker fetchers =====
  const fetchWorkerJobs = useCallback(async () => {
    const res = await fetch(makeUrl('/api/jobs/match', { workerId: trimmedUserId, limit: '25', offset: '0' }))
    const data = await res.json().catch(() => ({} as { jobs?: MatchedJob[] }))
    if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to load jobs')
    setJobs(Array.isArray(data.jobs) ? data.jobs : [])
  }, [makeUrl, trimmedUserId])

  const fetchWorkerBookings = useCallback(async () => {
    const res = await fetch(makeUrl('/api/bookings', { role: 'worker' }), {
      headers: { 'x-user-id': trimmedUserId },
    })
    const data = await res.json().catch(() => ({} as { bookings?: Booking[] }))
    if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to load bookings')
    setWorkerBookings(Array.isArray(data.bookings) ? data.bookings : [])
  }, [makeUrl, trimmedUserId])

  const fetchWorkerChats = useCallback(async () => {
    const res = await fetch(makeUrl('/api/messages/list', { userId: trimmedUserId }), {
      headers: { 'x-user-id': trimmedUserId },
    })
    const data = await res.json().catch(() => ({} as { chats?: ChatSummary[] }))
    if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to load chats')
    setWorkerChats(Array.isArray(data.chats) ? data.chats : [])
  }, [makeUrl, trimmedUserId])

  const fetchWorkerEarnings = useCallback(async () => {
    const res = await fetch(makeUrl(`/api/tax/earnings/${trimmedUserId}`), {
      headers: { 'x-user-id': trimmedUserId },
    })
    const data = (await res.json().catch(() => ({}))) as EarningsResponse & { error?: string }
    if (!res.ok) throw new Error(data.error ?? 'Failed to load earnings')
    setEarnings(data)
  }, [makeUrl, trimmedUserId])

  // ===== Homeowner fetchers =====
  const fetchMyJobs = useCallback(async () => {
    const res = await fetch(makeUrl('/api/jobs', { employerId: trimmedUserId, limit: '50' }), {
      headers: { 'x-user-id': trimmedUserId },
    })
    const data = await res.json().catch(() => ({} as { jobs?: PostedJob[] }))
    if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to load jobs')
    setMyJobs(Array.isArray(data.jobs) ? (data.jobs as PostedJob[]) : [])
  }, [makeUrl, trimmedUserId])

  const fetchWorkersDirectory = useCallback(async () => {
    const res = await fetch(makeUrl('/api/workers', { limit: '25' }))
    const data = await res.json().catch(() => ({} as { workers?: WorkerSummary[] }))
    if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to load workers')
    setWorkers(Array.isArray(data.workers) ? data.workers : [])
  }, [makeUrl])

  const fetchHomeownerBookings = useCallback(async () => {
    const res = await fetch(makeUrl('/api/bookings', { role: 'homeowner' }), {
      headers: { 'x-user-id': trimmedUserId },
    })
    const data = await res.json().catch(() => ({} as { bookings?: Booking[] }))
    if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to load bookings')
    setHomeownerBookings(Array.isArray(data.bookings) ? data.bookings : [])
  }, [makeUrl, trimmedUserId])

  const fetchHomeownerChats = useCallback(async () => {
    const res = await fetch(makeUrl('/api/messages/list', { userId: trimmedUserId }), {
      headers: { 'x-user-id': trimmedUserId },
    })
    const data = await res.json().catch(() => ({} as { chats?: ChatSummary[] }))
    if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to load chats')
    setHomeownerChats(Array.isArray(data.chats) ? data.chats : [])
  }, [makeUrl, trimmedUserId])

  const refreshSelectedTab = useCallback(async () => {
    if (!isConfigured) {
      Alert.alert('Setup required', 'Enter your API base URL and user UID first.')
      return
    }

    setLoading(true)
    try {
      if (role === 'worker') {
        if (workerTab === 'jobs') await fetchWorkerJobs()
        if (workerTab === 'bookings') await fetchWorkerBookings()
        if (workerTab === 'chat') await fetchWorkerChats()
        if (workerTab === 'earnings') await fetchWorkerEarnings()
      } else {
        if (homeownerTab === 'my-jobs') await fetchMyJobs()
        if (homeownerTab === 'workers') await fetchWorkersDirectory()
        if (homeownerTab === 'bookings') await fetchHomeownerBookings()
        if (homeownerTab === 'chat') await fetchHomeownerChats()
        // post-job has no fetch
      }
    } catch (error) {
      Alert.alert('Request failed', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [
    fetchHomeownerBookings,
    fetchHomeownerChats,
    fetchMyJobs,
    fetchWorkerBookings,
    fetchWorkerChats,
    fetchWorkerEarnings,
    fetchWorkerJobs,
    fetchWorkersDirectory,
    homeownerTab,
    isConfigured,
    role,
    workerTab,
  ])

  const applyToJob = useCallback(
    async (job: MatchedJob) => {
      const rate = Number(applicationRate)
      if (!job.id || !job.employerId) {
        Alert.alert('Unable to apply', 'This job is missing employer data.')
        return
      }
      if (!applicationCoverLetter.trim() || !Number.isFinite(rate) || rate <= 0) {
        Alert.alert('Missing fields', 'Enter a cover letter and a valid proposed rate.')
        return
      }

      setApplyingJobId(job.id)
      try {
        const res = await fetch(makeUrl('/api/applications'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: job.id,
            workerId: trimmedUserId,
            workerName: displayName.trim() || 'Worker',
            employerId: job.employerId,
            jobTitle: job.title ?? 'Untitled Job',
            coverLetter: applicationCoverLetter.trim(),
            proposedRate: rate,
          }),
        })
        const data = await res.json().catch(() => ({} as { error?: string }))
        if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Application failed')
        Alert.alert('Applied', 'Your application has been sent.')
      } catch (error) {
        Alert.alert('Could not apply', error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setApplyingJobId(null)
      }
    },
    [applicationCoverLetter, applicationRate, displayName, makeUrl, trimmedUserId],
  )

  const postNewJob = useCallback(async () => {
    if (!isConfigured) {
      Alert.alert('Setup required', 'Enter your API base URL and user UID first.')
      return
    }
    const budgetValue = Number(newJobBudget)
    const hasTitle = newJobTitle.trim().length > 0
    const hasDescription = newJobDescription.trim().length > 0
    const hasLocation = newJobLocation.trim().length > 0
    const hasValidBudget = Number.isFinite(budgetValue) && budgetValue > 0
    if (!hasTitle || !hasDescription || !hasLocation || !hasValidBudget) {
      Alert.alert('Missing fields', 'Enter title, description, location and a positive budget.')
      return
    }
    setPosting(true)
    try {
      const res = await fetch(makeUrl('/api/jobs'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': trimmedUserId,
        },
        body: JSON.stringify({
          title: newJobTitle.trim(),
          description: newJobDescription.trim(),
          category: newJobCategory.trim() || 'general',
          location: newJobLocation.trim(),
          budget: budgetValue,
          budgetType: 'fixed',
          urgency: 'medium',
          employerId: trimmedUserId,
          employerName: displayName.trim() || 'Homeowner',
        }),
      })
      const data = await res.json().catch(() => ({} as { error?: string }))
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to post job')
      Alert.alert('Job posted', 'Your job is now live.')
      setNewJobTitle('')
      setNewJobDescription('')
      setNewJobLocation('')
      setNewJobBudget('')
      // Refresh My Jobs list so it shows immediately when user switches tabs
      fetchMyJobs().catch(() => {})
    } catch (error) {
      Alert.alert('Could not post', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setPosting(false)
    }
  }, [
    displayName,
    fetchMyJobs,
    isConfigured,
    makeUrl,
    newJobBudget,
    newJobCategory,
    newJobDescription,
    newJobLocation,
    newJobTitle,
    trimmedUserId,
  ])

  const activeTabLabel = role === 'worker'
    ? WORKER_TABS.find((t) => t.key === workerTab)?.label ?? workerTab
    : HOMEOWNER_TABS.find((t) => t.key === homeownerTab)?.label ?? homeownerTab

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Text style={styles.title}>QuickTrade Mobile (MVP)</Text>
        <Text style={styles.subtitle}>
          {role === 'worker'
            ? 'Browse jobs, apply, track bookings, chat status, and earnings.'
            : 'Post jobs, browse workers, manage bookings and chats.'}
        </Text>

        <View style={styles.roleRow}>
          {(['worker', 'homeowner'] as Role[]).map((r) => {
            const active = role === r
            return (
              <Pressable
                key={r}
                onPress={() => setRole(r)}
                style={[styles.roleButton, active ? styles.roleButtonActive : null]}
              >
                <Text style={[styles.roleText, active ? styles.roleTextActive : null]}>
                  {r === 'worker' ? 'Worker' : 'Homeowner'}
                </Text>
              </Pressable>
            )
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connection</Text>
          <TextInput
            style={styles.input}
            value={apiBaseUrl}
            onChangeText={setApiBaseUrl}
            autoCapitalize="none"
            placeholder="API Base URL (e.g. https://quicktrade.co.nz)"
            placeholderTextColor="#7c8798"
          />
          <TextInput
            style={styles.input}
            value={userId}
            onChangeText={setUserId}
            autoCapitalize="none"
            placeholder={role === 'worker' ? 'Worker UID (x-user-id)' : 'Homeowner UID (x-user-id)'}
            placeholderTextColor="#7c8798"
          />
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={role === 'worker' ? 'Worker name (for job applications)' : 'Homeowner name (for posted jobs)'}
            placeholderTextColor="#7c8798"
          />
        </View>

        <View style={styles.tabRow}>
          {role === 'worker'
            ? WORKER_TABS.map((tab) => {
                const active = workerTab === tab.key
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setWorkerTab(tab.key)}
                    style={[styles.tabButton, active ? styles.tabButtonActive : null]}
                  >
                    <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>{tab.label}</Text>
                  </Pressable>
                )
              })
            : HOMEOWNER_TABS.map((tab) => {
                const active = homeownerTab === tab.key
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setHomeownerTab(tab.key)}
                    style={[styles.tabButton, active ? styles.tabButtonActive : null]}
                  >
                    <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>{tab.label}</Text>
                  </Pressable>
                )
              })}
        </View>

        {/* Post Job tab has its own action button instead of refresh */}
        {role === 'homeowner' && homeownerTab === 'post-job' ? null : (
          <Pressable onPress={refreshSelectedTab} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>{loading ? 'Loading…' : `Refresh ${activeTabLabel}`}</Text>
          </Pressable>
        )}

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {loading ? (
            <ActivityIndicator color="#8b5cf6" />
          ) : role === 'worker' ? (
            <>
              {workerTab === 'jobs' && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Matched Jobs ({jobs.length})</Text>
                  <TextInput
                    style={styles.input}
                    value={applicationCoverLetter}
                    onChangeText={setApplicationCoverLetter}
                    multiline
                    placeholder="Application cover letter"
                    placeholderTextColor="#7c8798"
                  />
                  <TextInput
                    style={styles.input}
                    value={applicationRate}
                    onChangeText={setApplicationRate}
                    keyboardType="numeric"
                    placeholder="Proposed rate (NZD)"
                    placeholderTextColor="#7c8798"
                  />
                  {jobs.length === 0 && <Text style={styles.mutedText}>No jobs returned yet.</Text>}
                  {jobs.map((job) => (
                    <View key={job.id} style={styles.listItem}>
                      <Text style={styles.itemTitle}>{job.title ?? 'Untitled job'}</Text>
                      <Text style={styles.itemMeta}>
                        {job.location ?? 'Location TBC'} · {formatNZD(job.budget)}
                      </Text>
                      <Text style={styles.itemMeta}>Match score: {Math.round((job.matchScore ?? 0) * 100)}%</Text>
                      <Pressable
                        onPress={() => applyToJob(job)}
                        disabled={applyingJobId === job.id}
                        style={[styles.secondaryButton, applyingJobId === job.id ? styles.disabledButton : null]}
                      >
                        <Text style={styles.secondaryButtonText}>
                          {applyingJobId === job.id ? 'Applying…' : 'Apply'}
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              {workerTab === 'bookings' && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Bookings ({workerBookings.length})</Text>
                  {workerBookings.length === 0 && <Text style={styles.mutedText}>No booking requests yet.</Text>}
                  {workerBookings.map((booking) => (
                    <View key={booking.id} style={styles.listItem}>
                      <Text style={styles.itemTitle}>{booking.homeownerName ?? 'Homeowner'}</Text>
                      <Text style={styles.itemMeta}>
                        {booking.requestedDate ?? '-'} {booking.requestedTime ?? ''}
                      </Text>
                      <Text style={styles.itemMeta}>Status: {booking.status ?? 'unknown'}</Text>
                      {booking.address ? <Text style={styles.itemMeta}>{booking.address}</Text> : null}
                      {booking.description ? <Text style={styles.itemMeta}>{booking.description}</Text> : null}
                    </View>
                  ))}
                </View>
              )}

              {workerTab === 'chat' && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Chat Conversations ({workerChats.length})</Text>
                  {workerChats.length === 0 && (
                    <Text style={styles.mutedText}>
                      No conversation data returned by REST endpoint. Realtime chat uses Firestore listeners.
                    </Text>
                  )}
                  {workerChats.map((chat) => (
                    <View key={chat.id} style={styles.listItem}>
                      <Text style={styles.itemTitle}>{chat.title ?? 'Conversation'}</Text>
                      <Text style={styles.itemMeta}>{chat.lastMessage ?? 'No message preview'}</Text>
                    </View>
                  ))}
                </View>
              )}

              {workerTab === 'earnings' && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Earnings Snapshot</Text>
                  <Text style={styles.itemMeta}>Gross: {formatNZD(earnings?.totals?.gross)}</Text>
                  <Text style={styles.itemMeta}>Net: {formatNZD(earnings?.totals?.net)}</Text>
                  <Text style={styles.itemMeta}>Fees: {formatNZD(earnings?.totals?.fees)}</Text>
                  <Text style={styles.itemMeta}>Records: {earnings?.totals?.count ?? 0}</Text>
                  {(earnings?.records ?? []).slice(0, 8).map((record, index) => (
                    <View key={record.id ?? `record-${index}`} style={styles.listItem}>
                      <Text style={styles.itemTitle}>{record.jobTitle ?? 'Job payout'}</Text>
                      <Text style={styles.itemMeta}>
                        Gross {formatNZD(record.grossAmount)} · Net {formatNZD(record.netAmount)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <>
              {homeownerTab === 'my-jobs' && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>My Jobs ({myJobs.length})</Text>
                  {myJobs.length === 0 && <Text style={styles.mutedText}>No posted jobs yet.</Text>}
                  {myJobs.map((job) => (
                    <View key={job.id} style={styles.listItem}>
                      <Text style={styles.itemTitle}>{job.title ?? 'Untitled job'}</Text>
                      <Text style={styles.itemMeta}>
                        {job.location ?? 'Location TBC'} · {formatNZD(job.budget)}
                      </Text>
                      <Text style={styles.itemMeta}>
                        Status: {job.status ?? 'open'} · {job.applicantsCount ?? 0} quotes
                      </Text>
                      {job.description ? <Text style={styles.itemMeta}>{job.description}</Text> : null}
                    </View>
                  ))}
                </View>
              )}

              {homeownerTab === 'post-job' && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Post a New Job</Text>
                  <TextInput
                    style={styles.input}
                    value={newJobTitle}
                    onChangeText={setNewJobTitle}
                    placeholder="Job title (e.g. Fix leaking tap)"
                    placeholderTextColor="#7c8798"
                  />
                  <TextInput
                    style={styles.input}
                    value={newJobDescription}
                    onChangeText={setNewJobDescription}
                    multiline
                    placeholder="Describe the job"
                    placeholderTextColor="#7c8798"
                  />
                  <TextInput
                    style={styles.input}
                    value={newJobCategory}
                    onChangeText={setNewJobCategory}
                    autoCapitalize="none"
                    placeholder="Category (e.g. plumbing, electrical)"
                    placeholderTextColor="#7c8798"
                  />
                  <TextInput
                    style={styles.input}
                    value={newJobLocation}
                    onChangeText={setNewJobLocation}
                    placeholder="Location (e.g. Wellington)"
                    placeholderTextColor="#7c8798"
                  />
                  <TextInput
                    style={styles.input}
                    value={newJobBudget}
                    onChangeText={setNewJobBudget}
                    keyboardType="numeric"
                    placeholder="Budget (NZD)"
                    placeholderTextColor="#7c8798"
                  />
                  <Pressable
                    onPress={postNewJob}
                    disabled={posting}
                    style={[styles.secondaryButton, posting ? styles.disabledButton : null]}
                  >
                    <Text style={styles.secondaryButtonText}>{posting ? 'Posting…' : 'Post Job'}</Text>
                  </Pressable>
                </View>
              )}

              {homeownerTab === 'workers' && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Browse Workers ({workers.length})</Text>
                  {workers.length === 0 && <Text style={styles.mutedText}>No workers loaded yet.</Text>}
                  {workers.map((worker) => (
                    <View key={worker.uid} style={styles.listItem}>
                      <Text style={styles.itemTitle}>{worker.displayName ?? 'Worker'}</Text>
                      <Text style={styles.itemMeta}>
                        {worker.location ?? 'Location TBC'} · Rating {(worker.rating ?? 0).toFixed(1)}
                      </Text>
                      {Array.isArray(worker.skills) && worker.skills.length > 0 ? (
                        <Text style={styles.itemMeta}>Skills: {worker.skills.slice(0, 5).join(', ')}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}

              {homeownerTab === 'bookings' && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Bookings ({homeownerBookings.length})</Text>
                  {homeownerBookings.length === 0 && <Text style={styles.mutedText}>No bookings yet.</Text>}
                  {homeownerBookings.map((booking) => (
                    <View key={booking.id} style={styles.listItem}>
                      <Text style={styles.itemTitle}>{booking.workerName ?? 'Worker'}</Text>
                      <Text style={styles.itemMeta}>
                        {booking.requestedDate ?? '-'} {booking.requestedTime ?? ''}
                      </Text>
                      <Text style={styles.itemMeta}>Status: {booking.status ?? 'unknown'}</Text>
                      {booking.address ? <Text style={styles.itemMeta}>{booking.address}</Text> : null}
                      {booking.description ? <Text style={styles.itemMeta}>{booking.description}</Text> : null}
                    </View>
                  ))}
                </View>
              )}

              {homeownerTab === 'chat' && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Chat Conversations ({homeownerChats.length})</Text>
                  {homeownerChats.length === 0 && (
                    <Text style={styles.mutedText}>
                      No conversation data returned by REST endpoint. Realtime chat uses Firestore listeners.
                    </Text>
                  )}
                  {homeownerChats.map((chat) => (
                    <View key={chat.id} style={styles.listItem}>
                      <Text style={styles.itemTitle}>{chat.title ?? 'Conversation'}</Text>
                      <Text style={styles.itemMeta}>{chat.lastMessage ?? 'No message preview'}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: '#0f172a',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1e293b',
  },
  roleButtonActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  roleText: {
    textAlign: 'center',
    color: '#cbd5e1',
    fontWeight: '700',
  },
  roleTextActive: {
    color: '#fff',
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tabButton: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 90,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  tabButtonActive: {
    backgroundColor: '#7c3aed',
  },
  tabText: {
    textAlign: 'center',
    color: '#cbd5e1',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  refreshButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 12,
  },
  refreshButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  listItem: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  itemTitle: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  itemMeta: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 2,
  },
  mutedText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  secondaryButton: {
    marginTop: 8,
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
})
