import { useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import { Video, VideoOff, Mic, MicOff, Phone } from 'lucide-react'

interface Props {
  socket: Socket | null
  roomId: string
}

export default function VideoChat({ socket, roomId }: Props) {
  const localRef = useRef<HTMLVideoElement>(null)
  const remoteRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const [started, setStarted] = useState(false)
  const [videoOn, setVideoOn] = useState(true)
  const [audioOn, setAudioOn] = useState(true)
  const localStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (!socket) return

    const handleSignal = async ({ data }: { from: string; data: any }) => {
      if (!pcRef.current) await initPeer()
      try {
        if (data.sdp) {
          await pcRef.current!.setRemoteDescription(new RTCSessionDescription(data.sdp))
          if (data.sdp.type === 'offer') {
            const ans = await pcRef.current!.createAnswer()
            await pcRef.current!.setLocalDescription(ans)
            socket.emit('signal', { roomId, data: { sdp: pcRef.current!.localDescription } })
          }
        } else if (data.candidate) {
          await pcRef.current!.addIceCandidate(new RTCIceCandidate(data.candidate))
        }
      } catch (err) {
        console.error('WebRTC signal error:', err)
      }
    }

    socket.on('signal', handleSignal)
    return () => { socket.off('signal', handleSignal) }
  }, [socket, roomId])

  const initPeer = async () => {
    pcRef.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })

    pcRef.current.onicecandidate = (e) => {
      if (e.candidate) socket?.emit('signal', { roomId, data: { candidate: e.candidate } })
    }

    pcRef.current.ontrack = (e) => {
      if (remoteRef.current) remoteRef.current.srcObject = e.streams[0]
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localStreamRef.current = stream
    if (localRef.current) localRef.current.srcObject = stream
    stream.getTracks().forEach(track => pcRef.current!.addTrack(track, stream))

    return pcRef.current
  }

  const startCall = async () => {
    if (!pcRef.current) await initPeer()
    const offer = await pcRef.current!.createOffer()
    await pcRef.current!.setLocalDescription(offer)
    socket?.emit('signal', { roomId, data: { sdp: pcRef.current!.localDescription } })
    setStarted(true)
  }

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
    setVideoOn(v => !v)
  }

  const toggleAudio = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
    setAudioOn(a => !a)
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-3 space-y-2">
      <h4 className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
        <Video size={14} /> Video Chat
      </h4>
      <div className="flex gap-2">
        <video ref={localRef} autoPlay muted playsInline className="w-1/2 aspect-video bg-black rounded object-cover" />
        <video ref={remoteRef} autoPlay playsInline className="w-1/2 aspect-video bg-black rounded object-cover" />
      </div>
      <div className="flex gap-2">
        {!started ? (
          <button onClick={startCall} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors">
            <Phone size={12} /> Start Call
          </button>
        ) : (
          <>
            <button onClick={toggleVideo} className={`p-1.5 rounded text-xs ${videoOn ? 'bg-dark-border text-white' : 'bg-red-600 text-white'}`}>
              {videoOn ? <Video size={14} /> : <VideoOff size={14} />}
            </button>
            <button onClick={toggleAudio} className={`p-1.5 rounded text-xs ${audioOn ? 'bg-dark-border text-white' : 'bg-red-600 text-white'}`}>
              {audioOn ? <Mic size={14} /> : <MicOff size={14} />}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
