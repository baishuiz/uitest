var  item_sku = [6250719846,9739369984,7327289124,9461139478,13483264708,9567008743,9436950792,17679971273,15548524760,22608052824,19429316712,17883760731,18881312325,21083452181,7159737917,10816125427,8602282779,18448736992,16738908532,14738967160,14293625503,9387891204,16705556250,
16476524878,10854276487,14393972734,10472109165,12647292018,12213936879,15154390743,14708479467];
var  item_sku = [6250719846,9739369984,7327289124];

var item_sku= [9739369984];

UT.taobao.login("mayun902","taobao1234");
for(var ii=0;ii<item_sku.length;ii++){
    //  UT.configs.autoClose = false;
    win = UT.open("http://item.taobao.com/item.htm?id="+item_sku[ii], function () {
        describe("不选择sku弹出提示后再选择sku购买", function() {
            var sku_num = $("div#J_isku dl[class^='tb-prop']").length;
            var sku_dl = $("div#J_isku dl[class^='tb-prop']");
            var allProps = [],pvals = [], selected_sku = [];
            //判断是否有sku并且不是唯一的sku默认选中的情况
            var allProps = [],pvals = [],selected_sku = [];
            //判断是否有sku并且不是唯一的sku默认选中的情况
            for (var i = 0 ; i < sku_num ; i++) {
                //获取所有的sku值
                allProps[i] = $("div#J_isku dl[class^='tb-prop']:eq(" + i + ") li a");
                pvals[i] = $("div#J_isku dl[class^='tb-prop']:eq(" + i + ") li ");
                // 获取所有sku值
                var  pval_len = $("div#J_isku dl[class^='tb-prop'] li a").length;
            }
            //sku属性不止1个，且不是每个sku只有1个属性值的默认选中情况
            if (sku_num >= 1 && pval_len > sku_num ){
                it('不选择sku直接购买',	function(){
                    runs(function(){
                        simulate("a[class='J_ClickCatcher\\ J_LinkBuy']", 'click');
                    });
                    runs(function(){
                        //判断sku确认区域存在
                        expect($("div#J_SureSKU").css("display")).toBe('block');
                        //判断sku选择提示文案存在
                        expect($("div#J_SureSKU").html()).toContain('请勾选您要的商品信息');
                        //循环获取每行的sku值组成一个可用库存
                        //随机选2个可用sku
                 for (var i = 0 ; i < sku_num ; i++) {
                            var currentLineProps = allProps[i];
                            var pval=pvals[i];
                            // jasmine.simulate( pvals[i].not($(".tb-out-of-stock")[0]), 'click');
                            for (var k = 0 ; k <  pvals[i].length ; k++) {
                                if($(pval[k]).hasClass("tb-out-of-stock")|| pvals[i].length ==1){
                                    continue;
                                }
                                simulate(currentLineProps[k],'click');
                                //   alert(k);
                                break;
                            }
                        }
                    });
                    runs(function(){
                        simulate("a[class='J_ClickCatcher\\ J_LinkBuy']", 'click');
                    });
                });
            }
            // sku属性不止1个，但是每个sku只有1个属性值的默认选中情况,先取消，再选中，这个太无聊了  md
            else    if (sku_num > 0 && pval_len == sku_num ){
                //取消所有sku组合
                it('sku属性不止1个，但是每个sku只有1个属性值的默认选中情况',	function(){
                    runs(function(){
                        for (var i = 0 ; i < sku_num ; i++) {
                          //  var currentLineProps =  $("li a", sku_dl[i]);
                           // var pvals = $("li", sku_dl[i]);
                            var currentLineProps = allProps[i];
                        //    var pval=pvals[i];
                            for (var k = 0 ; k <  pvals[i].length ; k++) {
                                simulate(currentLineProps[k],"click");
                            }
                        }
                    });
                    //取消后再点击
                    runs(function(){
                        simulate("a[class='J_ClickCatcher\\ J_LinkBuy']", 'click');
                    });
                    waitsMatchers(function(){
                        //判断sku确认区域存在
                        expect($("div#J_SureSKU").css("display")).toBe('block');
                        //判断sku选择提示文案存在
                        expect($("div#J_SureSKU").html()).toContain('请勾选您要的商品信息');
                    //循环获取每行的sku值组成一个可用库存
                    });
                    runs(function(){
                        //随机选1个可用sku组合
                        for (var i = 0 ; i < sku_num ; i++) {
                            var currentLineProps = allProps[i];
                            var pval=pvals[i];
                            // jasmine.simulate( pvals[i].not($(".tb-out-of-stock")[0]), 'click');
                            for (var k = 0 ; k <  pvals[i].length ; k++) {
                                if($(pval[k]).hasClass("tb-out-of-stock")){
                                    continue;
                                }
                                jasmine.simulate(currentLineProps[k],'click');
                                // alert(k);
                                break;
                            }
                        }
                    });
                    runs(function(){
                        simulate("a[class='J_ClickCatcher\\ J_LinkBuy']", 'click');
                    });
                });
            }
            else if(sku_num == 0){
                it('没有sku的宝贝购买', function() {
                    simulate("a[class='J_ClickCatcher\\ J_LinkBuy']", 'click');
                });
            }

            else{
                it('异常情况', function() {
                    expect("1").toBe("2");
                });
            }
        });
    });
    win.ready(function () {
        //跳转到buy页面
        describe("buy页面跳转校验", function () {
            it("buy页面跳转校验", function () {
                //判断购买按钮存在
                expect("a#J_Go").toExist();
            })
        })
    });
}
