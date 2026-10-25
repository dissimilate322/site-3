/* Build a self-contained Linux Node.js deployment archive. Python 3 provides ZIP support. */
const fs=require('node:fs');const path=require('node:path');const os=require('node:os');const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');const output=path.resolve(process.argv[2]||path.join(root,'artifacts/meruem-wispbyte.zip'));
const build=spawnSync('npm',['run','build'],{cwd:root,env:{...process.env,WISPBYTE_BUILD:'1'},stdio:'inherit'});if(build.status!==0)process.exit(build.status||1);
const stage=fs.mkdtempSync(path.join(os.tmpdir(),'meruem-wispbyte-build-'));
try{
 fs.cpSync(path.join(root,'.next/standalone'),stage,{recursive:true,dereference:true});fs.cpSync(path.join(root,'public'),path.join(stage,'public'),{recursive:true});fs.cpSync(path.join(root,'.next/static'),path.join(stage,'.next/static'),{recursive:true});
 fs.writeFileSync(path.join(stage,'index.js'),"'use strict';\nprocess.env.HOSTNAME='0.0.0.0';\nprocess.env.PORT=process.env.PORT||process.env.SERVER_PORT||'3000';\nrequire('./server.js');\n");
 const manifest=JSON.parse(fs.readFileSync(path.join(stage,'package.json'),'utf8'));manifest.scripts={start:'node index.js'};delete manifest.devDependencies;manifest.engines={node:'>=20.9.0'};fs.writeFileSync(path.join(stage,'package.json'),JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(path.join(stage,'WISPBYTE-START.txt'),`meruem — FULL SITE\n\nNode.js 24 recommended (minimum 20.9). Linux x64 build.\nExtract into the server root. Startup file: index.js\nStart: node index.js (or npm start)\nPORT must match your allocated port; SERVER_PORT is also supported.\nNo npm install or build is needed. Preserve .next, public and node_modules.\n\nRoutes: /, /work, /company, /careers, /careers/senior-designer, and all six /work/[slug] case studies.\nAll media is local. Contact/application forms are previews: enquiries are not sent or stored.\n\nFor an existing Wispbyte installation: stop the server, replace the old application\nfiles including the entire .next, public and node_modules directories, then start index.js.\n`);
 fs.mkdirSync(path.dirname(output),{recursive:true});
 const py="from pathlib import Path\nfrom zipfile import ZipFile,ZIP_DEFLATED\nimport sys\ns=Path(sys.argv[1]);o=Path(sys.argv[2])\nwith ZipFile(o,'w',ZIP_DEFLATED,compresslevel=6) as z:\n for p in sorted(s.rglob('*')):\n  if p.is_file(): z.write(p,p.relative_to(s))\nwith ZipFile(o) as z: assert z.testzip() is None\nprint(str(o)+' — '+str(o.stat().st_size)+' bytes')\n";
 const zip=spawnSync('python3',['-c',py,stage,output],{stdio:'inherit'});if(zip.status!==0)process.exitCode=zip.status||1;
}finally{fs.rmSync(stage,{recursive:true,force:true})}
