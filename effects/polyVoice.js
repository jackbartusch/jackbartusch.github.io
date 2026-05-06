import Voice from "./voice.js";

export const voicings = {
    maj: {
        first: [0, 4, 7],
        second: [0, 4, 7, 11],//maj seventh
        third: [-12, 4, 7, 11, 2]//maj 9th
    },
    min: {
        first: [0, 3, 7],
        second: [0, 3, 7, 10],
        third: [-12, 3, 7, 10, 2]
    },
    dom: {
        first: [0, 4, 7, 10],
        second: [0, 4, 7, 10],
        third: [-12, 4, 7, 10]
    },
    sus4: {
        first: [0, 5, 7]
    },
    dim: {
        first: [0, 3, 6],
        second: [0, 3, 6, 9]
    }
}

export default class PolyVoice{
    constructor(){
        this.audioContext = new AudioContext();

        this.masterGain = this.audioContext.createGain();
        this.filter = new BiquadFilterNode(this.audioContext);
        this.masterGain.connect(this.filter);
        this.filter.connect(this.audioContext.destination);
        const maxVoices = 8;
        this.masterGain.gain.value = 1/maxVoices;
        this.filter.frequency.value = 4000;
        this.filter.Q.value = -10;

        this.activeVoices = new Map();
    }

    async initialise(){
        if(this.audioContext.state == 'suspended'){
            await this.audioContext.resume();
        }
    }

    note2Freq(baseFreq, semitone){
        let freq = baseFreq * Math.pow(2, semitone/12);
        if(freq > 800){
            return freq/2;
        }else{
            return freq;
        }
    }

    noteOn(frequency){
        if(this.activeVoices.has(frequency)) return;

        const voice = new Voice(this.audioContext, frequency, this.masterGain);
        this.activeVoices.set(frequency, voice);
        voice.start();
    }

    noteOff(frequency){
        const voice = this.activeVoices.get(frequency);
        if(voice){
            voice.stop();
            this.activeVoices.delete(frequency);
        }
    }

    currChord = [0,4,7];

    startChord(baseFreq, chord){
        this.currChord = chord;
        console.log(this.currChord);
        chord.forEach(interval => {
            const freq = this.note2Freq(baseFreq, interval);
            this.noteOn(freq);
        });
    }

    stopChord(baseFreq, chord){
        chord.forEach(interval => {
            const freq = this.note2Freq(baseFreq, interval);
            this.noteOff(freq);
        });
    }
    
}