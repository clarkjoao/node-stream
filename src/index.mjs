import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { createServer } from "node:http";

createServer((req, res) => {
  // Allow CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
  };

  // Allow CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  const ffmpegProcess = spawn(
    "ffmpeg", // Static path to ffmpeg
    [
      "-i", // First argument is always the input file
      "pipe:0", // Pipe the input file to ffmpeg
      "-f", // Output format
      "mp4",
      "-vcodec", // Video codec
      "h264",
      "-acodec", // Audio codec
      "aac",
      "-movflags", // Flags for the output file
      "frag_keyframe+empty_moov+default_base_moof",
      "-b:v", // Bitrate
      "1500k",
      "-maxrate", // Max bitrate
      "1500k",
      "-bufsize", // Buffer size
      "1000k",
      "-f", // Output format
      "mp4",
      "-y",
      "pipe:1", // Output the file to the response
    ],
    {
      stdio: ["pipe", "pipe", "pipe"], // Convert the input and output to pipes
    }
  );

  // Create a stream from the input file and pipe it to ffmpeg

  // Note:
  // ffmpegProcess are able to handle stdin, stdout and stderr as streams
  // so you can pipe them to other streams or files
  // https://nodejs.org/api/stream.html#stream_stream
  createReadStream("./assets/video2.mp4").pipe(ffmpegProcess.stdin);

  ffmpegProcess.stderr.on("data", (msg) => console.log(msg.toString()));
  ffmpegProcess.stdout.pipe(res);

  res.end();
}).listen(3000, () => console.log("Server is running..."));
