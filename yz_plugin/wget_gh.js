import plugin from '../../lib/plugins/plugin.js';
import fetch from 'node-fetch';

export class Mio extends plugin {
  constructor(e) {
    super({
      name: '澪',
      dsc: '自己做着玩的',
      event: 'message',
      priority: 1000,
      rule: [{
        reg: "^clone.*",
        fnc: 'wget_gh'
      }]
    });
  }

  async get_size(size){    
    const units = ['KB', 'MB', 'GB', 'TB'];

    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    const formattedSize = size.toFixed(2);
    const unit = units[unitIndex];

    return `${formattedSize} ${unit}`;
  }

  async wget_gh(e) {
    // console.log(e.msg);
    let GitHuburl = e.msg.replace(/^clone\s*(https?:\/\/.*)/g, "$1");
    console.log(GitHuburl);
    console.log("[gh下载项目]" + GitHuburl);
    let url = `https://api.fcip.xyz/git/download?url=${GitHuburl}`;
    let path = GitHuburl.replace('https://github.com/', '')

    let apiurl = `https://api.github.com/repos/${path}`

    try {
      const response = await fetch(apiurl);
      const data = await response.json();

      if (data.size) {
        
        const filesize = await this.get_size(data.size);

        e.reply(`收到项目克隆请求，开始克隆!\n项目信息:\n项目名称:${data.name}\n项目作者:${data.owner.login}\n项目大小:${filesize}\n创建时间:${data.created_at}\n最近更新:${data.pushed_at}\n当前有 ${data.stargazers_count} 个人⭐了这个项目`);
        e.reply(`克隆进行中......`);

      } else {
        e.reply('连接api接口失败！错误原因：' + JSON.stringify(data));
      }
    } catch (error) {
      console.error('连接api接口失败！错误原因：', error);
      e.reply('连接api接口失败！错误原因：' + error);
    }

    e.reply(segment.image(`https://opengraph.githubassets.com/Pretend-to/${path}`))

    try {
      const startTime = new Date().getTime(); // 获取开始时间

      const response = await fetch(url);
      const data = await response.json();

      if (data.downloadLink) {
        const endTime = new Date().getTime(); // 获取结束时间
        const clonetime = (endTime - startTime) / 1000; // 计算耗时，单位为秒

        e.reply(`克隆完成!耗时${clonetime}秒。复制链接到浏览器即可加速下载，链接24h过期哦！下载链接：${data.downloadLink}`, false);
      } else {
        e.reply('连接api接口失败！错误原因：' + JSON.stringify(data));
      }
    } catch (error) {
      console.error('连接api接口失败！错误原因：', error);
      e.reply('连接api接口失败！错误原因：' + error);
    }
  }
}
