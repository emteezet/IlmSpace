'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Hand, Users, X, PhoneOff, Settings } from 'lucide-react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || 'f09f1816f0ce4e0da832e96bfb70af32';

export default function LiveSpace({ session, user, onLeave }) {
    const [isMuted, setIsMuted] = useState(true);
    const [isRaisingHand, setIsRaisingHand] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [isHost, setIsHost] = useState(user.role === 'teacher');
    const [isJoined, setIsJoined] = useState(false);
    const [currentSession, setCurrentSession] = useState(session);

    // Sync session state (polling)
    useEffect(() => {
        const syncSession = async () => {
            try {
                const res = await fetch(`/api/sessions?classId=${session.class}`);
                const data = await res.json();
                if (data.success) {
                    const updated = data.sessions.find(s => s._id === session._id);
                    if (updated) setCurrentSession(updated);
                }
            } catch (err) {
                console.error("Failed to sync session:", err);
            }
        };

        const interval = setInterval(syncSession, 3000);
        return () => clearInterval(interval);
    }, [session._id, session.class]);

    const isUserSpeaker = isHost || currentSession.speakers?.some(s => (s._id || s) === user.id);
    const isUserHandRaised = currentSession.handRaises?.some(s => (s._id || s) === user.id);

    useEffect(() => {
        const initAgora = async () => {
            client.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

            client.current.on('user-published', async (remoteUser, mediaType) => {
                await client.current.subscribe(remoteUser, mediaType);
                if (mediaType === 'audio') {
                    remoteUser.audioTrack.play();
                    setParticipants(prev => [...new Set([...prev, remoteUser.uid])]);
                }
            });

            client.current.on('user-unpublished', (remoteUser) => {
                setParticipants(prev => prev.filter(uid => uid !== remoteUser.uid));
            });

            try {
                await client.current.join(APP_ID, session._id, null, user.id);
                setIsJoined(true);
            } catch (error) {
                console.error('Agora join failed:', error);
            }
        };

        initAgora();

        return () => {
            const leave = async () => {
                if (localAudioTrack.current) {
                    localAudioTrack.current.stop();
                    localAudioTrack.current.close();
                }
                if (client.current) {
                    await client.current.leave();
                }
            };
            leave();
        };
    }, [session._id, user.id]);

    // Handle speaker publication/unpublication
    useEffect(() => {
        const manageAudio = async () => {
            if (isUserSpeaker && isJoined) {
                if (!localAudioTrack.current) {
                    localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
                    await client.current.publish([localAudioTrack.current]);
                }
                localAudioTrack.current.setMuted(isMuted);
            } else if (!isUserSpeaker && localAudioTrack.current) {
                await client.current.unpublish([localAudioTrack.current]);
                localAudioTrack.current.stop();
                localAudioTrack.current.close();
                localAudioTrack.current = null;
            }
        };
        manageAudio();
    }, [isUserSpeaker, isJoined, isMuted]);

    if (!isJoined) {
        return (
            <div className="fixed inset-0 z-200 bg-black/90 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-lg font-medium">Entering Live Space...</p>
                </div>
            </div>
        );
    }

    const handleHandRaise = async () => {
        const action = isUserHandRaised ? 'hand-cancel' : 'hand-raise';
        await fetch(`/api/sessions/${session._id}/moderation`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ action })
        });
    };

    const [speakingUids, setSpeakingUids] = useState(new Set());
    const client = useRef(null);
    const localAudioTrack = useRef(null);

    // Agora Volume Indicator for speaking status
    useEffect(() => {
        if (!client.current) return;
        client.current.enableAudioVolumeIndicator();
        client.current.on('volume-indicator', (volumes) => {
            const speaking = new Set();
            volumes.forEach((v) => {
                if (v.level > 10) speaking.add(v.uid);
            });
            setSpeakingUids(speaking);
        });
    }, [isJoined]);

    const handleModeration = async (action, userId) => {
        if (!isHost) return;
        await fetch(`/api/sessions/${session._id}/moderation`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action, userId })
        });
    };

    const handleEndSession = async () => {
        if (!isHost) return;
        const res = await fetch(`/api/sessions/${session._id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'ended',
                recordingUrl: `https://mock-storage.com/recordings/${session._id}.mp3` // Simulation
            })
        });
        const data = await res.json();
        if (data.success) {
            onLeave();
        }
    };

    return (
        <div className="fixed inset-0 z-200 bg-black/95 backdrop-blur-xl flex flex-col">
            {/* Header */}
            <div className="h-20 border-b border-white/10 px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold">{session.title}</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            <span className="text-sm text-gray-400">Live Audio Session</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isHost && (
                        <button
                            onClick={handleEndSession}
                            className="px-6 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold rounded-xl border border-red-500/20 transition-all"
                        >
                            End Session
                        </button>
                    )}
                    <button onClick={onLeave} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Main content - Participants Grid */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8 text-center">
                    {/* Host Card */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className={`w-32 h-32 rounded-full glass flex items-center justify-center p-1.5 transition-all duration-500 ${speakingUids.has(user.id) ? 'shadow-[0_0_30px_rgba(16,185,129,0.3)] border-emerald-500 scale-105' : 'border-white/10'}`}>
                                <div className="w-full h-full rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-4xl uppercase border border-emerald-500/20">
                                    {session.teacher?.name?.[0] || 'T'}
                                </div>
                            </div>
                            <div className="absolute -bottom-2 right-2 bg-emerald-500 p-2 rounded-full border-4 border-black shadow-lg">
                                <Mic className="w-5 h-5 text-black" />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="font-black text-lg tracking-tight">Ustadh {session.teacher?.name || 'Teacher'}</p>
                            <p className="text-[10px] text-emerald-500/70 font-black uppercase tracking-[0.2em] mt-1">Prime Host</p>
                        </div>
                    </div>

                    {/* Speakers */}
                    {currentSession.speakers?.map((s) => (
                        <div key={s._id} className="flex flex-col items-center gap-4 group">
                            <div className="relative">
                                <div className={`w-24 h-24 rounded-full glass flex items-center justify-center p-1 transition-all duration-500 ${speakingUids.has(s._id) ? 'shadow-[0_0_20px_rgba(16,185,129,0.2)] border-emerald-500 scale-105' : 'border-white/10'}`}>
                                    <div className="w-full h-full rounded-full bg-emerald-500/5 flex items-center justify-center text-emerald-500 font-black text-2xl uppercase">
                                        {s.name?.[0] || 'S'}
                                    </div>
                                </div>
                                {isHost && (
                                    <button
                                        onClick={() => handleModeration('demote', s._id)}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white p-2 rounded-full border-4 border-black hover:scale-110 transition-all shadow-xl opacity-0 group-hover:opacity-100"
                                    >
                                        <MicOff className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black tracking-tight">{s.name}</p>
                                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest opacity-60">Speaker</span>
                            </div>
                        </div>
                    ))}

                    {/* Hand Raises (Visible to host) */}
                    {isHost && currentSession.handRaises?.map((s) => (
                        <div key={s._id} className="flex flex-col items-center gap-3 animate-bounce">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-gold-500/10 border-2 border-gold-500/50 flex items-center justify-center p-1">
                                    <div className="w-full h-full rounded-full bg-gold-500/5 flex items-center justify-center text-gold-500 font-bold text-xl uppercase">
                                        {s.name?.[0] || 'H'}
                                    </div>
                                </div>
                                <div className="absolute -top-1 -right-1 bg-gold-500 text-black p-1 rounded-full border border-[#111]">
                                    <Hand className="w-3 h-3" />
                                </div>
                            </div>
                            <p className="text-xs font-bold">{s.name}</p>
                            <div className="flex gap-1 mt-1">
                                <button
                                    onClick={() => handleModeration('promote', s._id)}
                                    className="px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-bold rounded-lg"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleModeration('hand-cancel', s._id)}
                                    className="px-2 py-0.5 bg-white/10 text-white text-[10px] font-bold rounded-lg"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Placeholders */}
                    {(!currentSession.speakers?.length && !currentSession.handRaises?.length) && [1, 2, 3].map((i) => (
                        <div key={`p-${i}`} className="flex flex-col items-center gap-3 opacity-10">
                            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                <Users className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-sm text-gray-400">Discovering...</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Controls */}
            <div className="h-24 border-t border-white/10 px-8 flex items-center justify-between bg-[#0a0a0a]">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-6 py-3 glass rounded-2xl border border-white/5 shadow-inner">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Live</span>
                        <div className="w-px h-4 bg-white/10 mx-2"></div>
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-black text-gray-300">{participants.length + (currentSession.speakers?.length || 0) + 1}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {isUserSpeaker && (
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className={`p-4 rounded-full transition-all border ${isMuted
                                ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                                }`}
                        >
                            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </button>
                    )}

                    {!isHost && (
                        <button
                            onClick={handleHandRaise}
                            className={`p-4 rounded-full transition-all border ${isUserHandRaised
                                ? 'bg-gold-500/10 border-gold-500/20 text-gold-500 hover:bg-gold-500/20'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <Hand className={`w-6 h-6 ${isUserHandRaised ? 'animate-bounce' : ''}`} />
                        </button>
                    )}

                    <button onClick={onLeave} className="p-4 bg-red-600/10 border border-red-600/20 text-red-600 hover:bg-red-600/20 rounded-full transition-all">
                        <PhoneOff className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    {isHost && (
                        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-gray-400">
                            <Settings className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
