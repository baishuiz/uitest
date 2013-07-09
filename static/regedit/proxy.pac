function FindProxyForURL(url,host) {
 return "PROXY 127.0.0.1:8081";

      if(/^https/.test(url)||/localhost/.test(url)){
            return "DIRECT"
      }
      else{
         return "PROXY 127.0.0.1:8081"
      }
}