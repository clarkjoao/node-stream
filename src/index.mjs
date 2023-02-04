import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { createServer } from "node:http";

createServer((req, res) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
  };
  if (req.method === "OPTIONS") {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  const ffmpegProcess = spawn(
    "ffmpeg",
    [
      "-i",
      "pipe:0",
      "-f",
      "mp4",
      "-vcodec",
      "h264",
      "-acodec",
      "aac",
      "-movflags",
      "frag_keyframe+empty_moov+default_base_moof",
      "-b:v",
      "1500k",
      "-maxrate",
      "1500k",
      "-bufsize",
      "1000k",
      "-f",
      "mp4",
      "-y",
      "pipe:1",
    ],
    {
      stdio: ["pipe", "pipe", "pipe"],
    }
  );

  createReadStream("./assets/video2.mp4").pipe(ffmpegProcess.stdin);

  ffmpegProcess.stderr.on("data", (msg) => console.log(msg.toString()));
  ffmpegProcess.stdout.pipe(res);

  res.end();
}).listen(3000, () => console.log("Server is running..."));
