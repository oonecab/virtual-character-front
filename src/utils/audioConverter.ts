/**
 * 音频格式转换工具
 */

export class AudioConverter {
  /**
   * 将WebM格式的音频转换为WAV格式
   * @param webmBlob WebM格式的音频Blob
   * @returns Promise<Blob> WAV格式的音频Blob
   */
  static async webmToWav(webmBlob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // 创建音频上下文
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // 读取WebM文件
        const fileReader = new FileReader();
        fileReader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            
            // 解码音频数据
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // 转换为WAV格式
            const wavBlob = this.audioBufferToWav(audioBuffer);
            resolve(wavBlob);
          } catch (error) {
            console.error('音频解码失败:', error);
            reject(error);
          }
        };
        
        fileReader.onerror = () => {
          reject(new Error('文件读取失败'));
        };
        
        fileReader.readAsArrayBuffer(webmBlob);
      } catch (error) {
        console.error('音频转换失败:', error);
        reject(error);
      }
    });
  }

  /**
   * 将AudioBuffer转换为WAV格式的Blob
   * @param audioBuffer AudioBuffer对象
   * @returns Blob WAV格式的音频Blob
   */
  private static audioBufferToWav(audioBuffer: AudioBuffer): Blob {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length * numberOfChannels * 2; // 16位音频
    
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    
    // WAV文件头
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    // RIFF标识符
    writeString(0, 'RIFF');
    // 文件长度
    view.setUint32(4, 36 + length, true);
    // WAVE标识符
    writeString(8, 'WAVE');
    // fmt子块
    writeString(12, 'fmt ');
    // fmt子块长度
    view.setUint32(16, 16, true);
    // 音频格式 (PCM = 1)
    view.setUint16(20, 1, true);
    // 声道数
    view.setUint16(22, numberOfChannels, true);
    // 采样率
    view.setUint32(24, sampleRate, true);
    // 字节率
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    // 块对齐
    view.setUint16(32, numberOfChannels * 2, true);
    // 位深度
    view.setUint16(34, 16, true);
    // data子块
    writeString(36, 'data');
    // data子块长度
    view.setUint32(40, length, true);
    
    // 写入音频数据
    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = audioBuffer.getChannelData(channel)[i];
        // 转换为16位整数
        const intSample = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, intSample < 0 ? intSample * 0x8000 : intSample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * 检查浏览器是否支持音频转换
   * @returns boolean
   */
  static isSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }
}