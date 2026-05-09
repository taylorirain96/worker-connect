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

type TabKey = 'jobs' | 'bookings' | 'chat' | 'earnings'

interface MatchedJob {
  id: string
  title?: string
  location?: string
  budget?: number
  matchScore?: number
  employerId?: string
  employerName?: string
}

interface Booking {
  id: string
  homeownerName?: string
  requestedDate?: string
  requestedTime?: string
  status?: 'pending' | 'confirmed' | 'declined'
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

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'jobs', label: 'Jobs' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'chat', label: 'Chat' },
  { key: 'earnings', label: 'Earnings' },
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
  const [selectedTab, setSelectedTab] = useState<TabKey>('jobs')
  const [loading, setLoading] = useState(false)

  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_BASE_URL)
  const [workerId, setWorkerId] = useState('')
  const [workerName, setWorkerName] = useState('')

  const [jobs, setJobs] = useState<MatchedJob[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [chats, setChats] = useState<ChatSummary[]>([])
  const [earnings, setEarnings] = useState<EarningsResponse | null>(null)

  const [applicationCoverLetter, setApplicationCoverLetter] = useState('')
  const [applicationRate, setApplicationRate] = useState('')
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null)

  const baseUrl = useMemo(() => apiBaseUrl.trim().replace(/\/$/, ''), [apiBaseUrl])
  const isConfigured = baseUrl.length > 0 && workerId.trim().length > 0

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

  const fetchWorkerJobs = useCallback(async () => {
    const res = await fetch(makeUrl('/api/jobs/match', { workerId: workerId.trim(), limit: '25', offset: '0' }))
    const data = await res.json().catch(() => ({} as { jobs?: MatchedJob[] }))
    if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to load jobs')
    setJobs(Array.isArray(data.jobs) ? data.jobs : [])
  }, [makeUrl, workerId])

  const fetchWorkerBookings = useCallback(async () => {
    const res = await fetch(makeUrl('/api/bookings', { role: 'worker' }), {
      headers: { 'x-user-id': workerId.trim() },
    })
    const data = await res.json().catch(() => ({} as { bookings?: Booking[] }))
    if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to load bookings')
    setBookings(Array.isArray(data.bookings) ? data.bookings : [])
  }, [makeUrl, workerId])

  const fetchWorkerChats = useCallback(async () => {
    const res = await fetch(makeUrl('/api/messages/list', { userId: workerId.trim() }), {
      headers: { 'x-user-id': workerId.trim() },
    })
    const data = await res.json().catch(() => ({} as { chats?: ChatSummary[] }))
    if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to load chats')
    setChats(Array.isArray(data.chats) ? data.chats : [])
  }, [makeUrl, workerId])

  const fetchWorkerEarnings = useCallback(async () => {
    const workerIdTrimmed = workerId.trim()
    const res = await fetch(makeUrl(`/api/tax/earnings/${workerIdTrimmed}`), {
      headers: { 'x-user-id': workerIdTrimmed },
    })
    const data = (await res.json().catch(() => ({}))) as EarningsResponse & { error?: string }
    if (!res.ok) throw new Error(data.error ?? 'Failed to load earnings')
    setEarnings(data)
  }, [makeUrl, workerId])

  const refreshSelectedTab = useCallback(async () => {
    if (!isConfigured) {
      Alert.alert('Setup required', 'Enter your API base URL and worker UID first.')
      return
    }

    setLoading(true)
    try {
      if (selectedTab === 'jobs') await fetchWorkerJobs()
      if (selectedTab === 'bookings') await fetchWorkerBookings()
      if (selectedTab === 'chat') await fetchWorkerChats()
      if (selectedTab === 'earnings') await fetchWorkerEarnings()
    } catch (error) {
      Alert.alert('Request failed', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [
    fetchWorkerBookings,
    fetchWorkerChats,
    fetchWorkerEarnings,
    fetchWorkerJobs,
    isConfigured,
    selectedTab,
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
            workerId: workerId.trim(),
            workerName: workerName.trim() || 'Worker',
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
    [applicationCoverLetter, applicationRate, makeUrl, workerId, workerName],
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Text style={styles.title}>QuickTrade Worker App (MVP)</Text>
        <Text style={styles.subtitle}>Browse jobs, apply, track bookings, chat status, and earnings.</Text>

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
            value={workerId}
            onChangeText={setWorkerId}
            autoCapitalize="none"
            placeholder="Worker UID (x-user-id)"
            placeholderTextColor="#7c8798"
          />
          <TextInput
            style={styles.input}
            value={workerName}
            onChangeText={setWorkerName}
            placeholder="Worker Name (for job applications)"
            placeholderTextColor="#7c8798"
          />
        </View>

        <View style={styles.tabRow}>
          {TABS.map((tab) => {
            const active = selectedTab === tab.key
            return (
              <Pressable
                key={tab.key}
                onPress={() => setSelectedTab(tab.key)}
                style={[styles.tabButton, active ? styles.tabButtonActive : null]}
              >
                <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>{tab.label}</Text>
              </Pressable>
            )
          })}
        </View>

        <Pressable onPress={refreshSelectedTab} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>{loading ? 'Loading…' : `Refresh ${selectedTab}`}</Text>
        </Pressable>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {loading ? (
            <ActivityIndicator color="#8b5cf6" />
          ) : (
            <>
              {selectedTab === 'jobs' && (
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

              {selectedTab === 'bookings' && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Bookings ({bookings.length})</Text>
                  {bookings.length === 0 && <Text style={styles.mutedText}>No booking requests yet.</Text>}
                  {bookings.map((booking) => (
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

              {selectedTab === 'chat' && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Chat Conversations ({chats.length})</Text>
                  {chats.length === 0 && (
                    <Text style={styles.mutedText}>
                      No conversation data returned by REST endpoint. Realtime chat uses Firestore listeners.
                    </Text>
                  )}
                  {chats.map((chat) => (
                    <View key={chat.id} style={styles.listItem}>
                      <Text style={styles.itemTitle}>{chat.title ?? 'Conversation'}</Text>
                      <Text style={styles.itemMeta}>{chat.lastMessage ?? 'No message preview'}</Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedTab === 'earnings' && (
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
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
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
    paddingVertical: 8,
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
