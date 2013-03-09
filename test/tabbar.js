var  item_sku = [6250719846,9739369984,7327289124,9461139478,13483264708,9567008743,9436950792,17679971273,15548524760,22608052824,19429316712,17883760731,18881312325,21083452181,7159737917,10816125427,8602282779,18448736992,16738908532,14738967160,14293625503,9387891204,16705556250,
16476524878,10854276487,14393972734,10472109165,12647292018,12213936879,15154390743,14708479467];
for(var ii=0;ii<item_sku.length;ii++){
    //  UT.configs.autoClose = false;
    UT.open("http://item.taobao.com/item.htm?id="+item_sku[ii], function () {
        //宝贝详情各tab的切换功能及一下所有元素属性校验
        describe("宝贝详情等TAB切换", function() {
            //是否有购买按钮，用来判断是否是一口价宝贝
            var isbuy = $("div#J_juValid").children().hasClass("tb-btn-buy");
            //是否拍卖
            var isbid = $("div#tbid-offer").children().hasClass("tbid-skin");
            it('宝贝详情等TAB切换', function() {
                runs(function() {
                    simulate("a.tb-tab-anchor:eq(0)", 'click');
                });
                waitsMatchers(function(){
                    //宝贝详情tab验证描述的style
                    expect("div#description").toHaveCSS('display','block');
                });
                runs(function() {
                    //校验免责声明的文案和占位、宝贝描述页面是否有侧边栏
                    pagelay();
                    //校验各tab的状态
                    tabstatus("block","none","none");
                });
                runs(function() {
                    //评价详情tab
                    simulate("a.tb-tab-anchor:eq(1)", 'click');
                });
                waitsMatchers(function(){
                    //判断评价加载状态结束后，再去取元素
                    expect("div#reviews div.tb-loading_stat").not.toExist();
                });
                // 评价详情Tab
                runs(function() {
                    //校验免责声明的文案和占位、页面是否有侧边栏
                    pagelay();
                    //先校验tab下除了评价没有其他装修信息或者无关信息
                    difftab(($("ul#J_TabBar")),($("div#reviews")));
                    //校验各tab的状态
                    tabstatus("none","none","block");
                    comparerate();
                });
                runs(function() {
                    //点击成交记录tab,分为拍卖和一口价2种情况
                    simulate("a.tb-tab-anchor:eq(2)", 'click');
                });
                waitsMatchers(function(){
                    //宝贝详情tab验证描述的style
                    expect("div#deal-record").toHaveCSS('display','block');
                });
                //判断是否有价格曲线图，如果要手工点击到列表模式查看数据
                runs(function() {
                    //alert($("div.tb-public-wrap>ul>li:eq(0)").attr("class"));
                    if(($("#deal-record>div:eq(1)").attr("style")) == "display: none;"){
                        simulate("div.tb-public-wrap>ul>li:eq(0)",'click');
                    }
                });
                waitsMatchers(function(){
                    expect("div#J_showListIndicator").not.toExist();
                });
                //成交记录tab
                runs(function() {
                    //校验免责声明的文案和占位、页面是否有侧边栏
                    //校验免责声明的文案和占位、宝贝描述页面是否有侧边栏
                    pagelay();
                    //先校验tab下除了成交记录没有其他装修信息或者无关信息
                    difftab(($("ul#J_TabBar")),($("div#deal-record")));
                    //校验各tab的状态
                    tabstatus("none","block","none");
                    //普通C宝贝，成交记录为0
                    if($("em.J_TDealCount:eq(1)").text() == 0 && isbuy){
                        //点击列表形式展示
                        //校验tab文案
                        //alert("普通C宝贝，成交记录为0");
                        deallist('成交记录','暂时还没有买家购买此宝贝，最近30天成交0件。','',$("p.tb-public-price"));
                    }
                    //拍卖宝贝，出价记录为0
                    else if($("em#J_BidRecord:eq(0)").text() == 0 && isbid){
                        //校验tab文案
                        //alert("拍卖宝贝，出价记录为0");
                        deallist('出价记录','暂时还没有买家竞拍此宝贝，最近30天成交0件','',$("div.attr-promise-tip"));
                    }
                    //拍卖宝贝，出价记录不为0
                    else if($("em#J_BidRecord:eq(0)").text() != 0 && isbid){
                        //alert("拍卖宝贝，出价记录不为0");
                        deallist('出价记录','买家出价记录','竞拍数量',$("div.attr-promise-tip"));
                    }
                    //普通C宝贝，成交记录不为0
                    else if($("em.J_TDealCount:eq(1)").text() != 0 && isbuy){
                        //点击列表形式展示
                        deallist('成交记录','拍下价格','付款时间',$("p.tb-public-price"));
                        //有查看更多成交记录和翻页
                        expect("div#J_showBuyerList>div").toHaveClass("tb-pagination");
                        expect("div#J_showBuyerList>p").toHaveClass("tb-view-all");
                    //    expect($("div#J_showBuyerList").children().hasClass("tb-pagination")).toBe(true);
                    //   expect($("div#J_showBuyerList").children().hasClass("tb-view-all")).toBe(true);
                    }
                    else{
                        expect(1).toBe(2);
                    }
                });
                runs(function() {
                    //最后再切换到宝贝详情tab
                    simulate("a.tb-tab-anchor:eq(0)", 'click');
                });
                //最后再切换到宝贝详情tab
                waitsMatchers(function(){
                    //宝贝详情tab验证描述的style
                    expect("div#description").toHaveCSS('display','block');
                });
                runs(function() {
                    //校验免责声明的文案和占位、宝贝描述页面是否有侧边栏
                    pagelay();
                    //校验各tab的状态
                    tabstatus("block","none","none")
                });
            //it结束
            });
            //校验免责声明的文案和占位、宝贝描述页面是否有侧边栏
            function pagelay(){
                expect($.trim($("div#official-remind").text())).toContain("交易过程中请勿使用阿里旺旺以外的聊天工具进行沟通，不要随意接收可疑文件和点击不明来源的链接，付款前务必核实网站域名和详细支付信息。");
               expect("div#official-remind").toHaveCSS("background-color","rgb(255, 255, 229)");
                //      expect($("div#official-remind").css("background-color")).toEqual('rgb(255, 255, 229)'||'#ffffe5');
                //判断是否有左侧栏
                col_region = $("div[class='col-main clearfix']>div[class^='main-wrap']").width();
                if(col_region == 750){
                    expect("#official-remind").toHaveCSS("width","728px");
                    expect("#official-remind").toHaveCSS("height","141px");
                }
                else if(col_region == 950){
                    expect("#official-remind").toHaveCSS("width","928px");
                    expect("#official-remind").toHaveCSS("height","117px");
                }
                else{
                    expect(1).toBe(2);
                }
            }
            //校验各tab的状态
            function tabstatus(status1,status2,status3){
                //宝贝详情tab验证描述的style
                expect("div#description").toHaveCSS("display",status1);
                //宝贝详情tab验证成交记录的style
                expect("div#deal-record").toHaveCSS("display",status2);
                //宝贝详情tab验证评价的style
                expect("div#reviews").toHaveCSS("display",status3);
            }
            //校验成交记录tab下的内容
            function deallist(text1,text2,text3,object){
                expect($("a.tb-tab-anchor:eq(2)").text()).toContain(text1);
                expect($("div#J_showBuyerList").html()).toContain(text2);
                expect($("div#J_showBuyerList").html()).toContain(text3);
                expect(object.html()).toContain('拍下价格的不同可能会由促销和打折引起的，详情可以咨询卖家。');
            }
            //校验评价tab下的内容
            function comparerate(){
                //校验好评、中评、差评的div存在
                expect($("div.tb-r-score").html()).toContain('宝贝与描述相符');
                expect($("div.tb-r-links").html()).toContain('店铺评价');
                //校验店铺评价的链接，不是特别准，遇到无店铺的时候会报错
                expect($("div.tb-r-links a").attr("href")).toContain('http://rate.taobao.com/user-rate');
                //校验购物保障
                expect($.trim($("p.tb-r-tip").text())).toContain('购物保障，明确您的售后保障权益。');
                expect($("p.tb-r-tip").html()).toContain('http://meal.taobao.com/cu_pr.htm?item_num_id');
                //校验评价内容
                //无内容
                if($("a.tb-tab-anchor:eq(1) em").text() == '0'){
                    expect("div.tb-revbd div").toHaveClass("tb-no-result");
                    //   expect($("div.tb-revbd div").hasClass("tb-no-result")).toBe(true);
                    expect($.trim($("div.tb-revbd div").text())).toEqual("没有找到结果");
                }
                //有内容
                else{
                    expect($("div.tb-revbd div").hasClass("tb-no-result")).toBe(false);
                    //校验评价内容存在，评价内容里的各个元素都在
                    expect("div.tb-revbd ul").toHaveClass("tb-r-comments");
                    expect("div.tb-revbd li").toHaveClass("tb-r-review");
                    expect("div.tb-revbd li>div:eq(0)").toHaveClass("tb-r-buyer");
                    expect("div.tb-revbd li>div:eq(1)").toHaveClass("tb-r-bd");
                //                    expect($("div.tb-revbd ul").hasClass("tb-r-comments")).toBe(true);
                //                    expect($("div.tb-revbd li").hasClass("tb-r-review")).toBe(true);
                //                    expect($("div.tb-revbd li>div:eq(0)").hasClass("tb-r-buyer")).toBe(true);
                //                    expect($("div.tb-revbd li>div:eq(1)").hasClass("tb-r-bd")).toBe(true);
                }
            }
            function difftab(object1,object2){
                //先校验tab下除了评价没有其他装修信息或者无关信息
                var offset1 = object1.offset();
                var offset2 = object2.offset();
                //   alert(( "offset1: " + offset1.top + ", offset2: " + offset2.top ));
                expect(offset2.top-offset1.top).toBe(29);
            }
        //decribe结束
        });
    });
}